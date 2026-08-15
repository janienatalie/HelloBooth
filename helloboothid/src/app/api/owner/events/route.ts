// src/app/api/owner/events/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const eventsRes = await query(`
      SELECT 
        e.id, 
        e.event_name, 
        c.name as client_name, 
        c.client_type,
        e.event_date,
        e.event_time,
        e.location,
        e.status,
        e.sales_id,
        COALESCE(i.paid_amount, 0) as paid_amount,
        COALESCE(i.discount_amount, 0) as discount_amount,
        COALESCE(i.total_amount, 0) as invoice_total_amount
      FROM events e
      LEFT JOIN clients c ON e.client_id = c.id
      LEFT JOIN invoices i ON e.id = i.event_id
      ORDER BY e.event_date DESC
    `);

    const itemsRes = await query(
      `SELECT event_id, item_id, item_type, item_price, quantity FROM event_items`,
    );

    // PERBAIKAN: Mengambil price_b2b dan price_b2c dari services
    const servicesRes = await query(
      `SELECT id, price_b2b, price_b2c FROM services`,
    );

    // Menggunakan SELECT * pada addons untuk berjaga-jaga jika addons juga diubah strukturnya
    const addonsRes = await query(`SELECT * FROM addons`);

    const events = eventsRes.rows || [];
    const eventItems = itemsRes.rows || [];

    // Memisahkan map harga berdasarkan divisi
    const servicePriceMap: Record<string, { b2b: number; b2c: number }> = {};
    const addonPriceMap: Record<string, { b2b: number; b2c: number }> = {};

    (servicesRes.rows || []).forEach((s: any) => {
      servicePriceMap[s.id] = {
        b2b: parseFloat(s.price_b2b) || 0,
        b2c: parseFloat(s.price_b2c) || 0,
      };
    });

    (addonsRes.rows || []).forEach((a: any) => {
      // Fallback yang aman: ambil price_b2b/b2c jika ada, kalau tidak ada pakai base_price
      addonPriceMap[a.id] = {
        b2b: parseFloat(a.price_b2b || a.base_price) || 0,
        b2c: parseFloat(a.price_b2c || a.base_price) || 0,
      };
    });

    const now = new Date();

    const formattedData = events.map((row: any) => {
      let grossTotal = 0;
      // Deteksi divisi klien untuk penentuan harga (Default ke B2C jika kosong)
      const cType = (row.client_type || "B2C").toUpperCase();

      const itemsForThisEvent = eventItems.filter(
        (ei: any) => ei.event_id === row.id,
      );

      itemsForThisEvent.forEach((item: any) => {
        let itemPrice = parseFloat(item.item_price);

        // Jika harga di event_items kosong, ambil dari master data (Service/Addon)
        if (!itemPrice) {
          const typeStr = item.item_type?.toLowerCase().trim();
          if (typeStr === "service") {
            itemPrice =
              cType === "B2B"
                ? servicePriceMap[item.item_id]?.b2b || 0
                : servicePriceMap[item.item_id]?.b2c || 0;
          } else {
            itemPrice =
              cType === "B2B"
                ? addonPriceMap[item.item_id]?.b2b || 0
                : addonPriceMap[item.item_id]?.b2c || 0;
          }
        }

        const quantity = parseInt(item.quantity) || 1;
        grossTotal += itemPrice * quantity;
      });

      const paidAmount = parseFloat(row.paid_amount) || 0;
      const discountAmount = parseFloat(row.discount_amount) || 0;
      const netTotal = Math.max(0, grossTotal - discountAmount);

      const eventStatus = (row.status || "inquiry").toLowerCase();
      const isCancelled =
        eventStatus === "cancelled" || eventStatus === "batal";

      const balance = isCancelled ? 0 : Math.max(0, netTotal - paidAmount);

      let paymentStatus = "Belum Dibayar";
      let paymentStatusEn = "Unpaid";

      if (paidAmount >= netTotal && netTotal > 0) {
        paymentStatus = "Lunas";
        paymentStatusEn = "Paid";
      } else if (paidAmount > 0) {
        paymentStatus = "DP";
        paymentStatusEn = "DP";
      }

      try {
        if (paymentStatus !== "Lunas" && !isCancelled && row.event_date) {
          const d = new Date(row.event_date);
          const year = d.getFullYear();
          const month = d.getMonth();
          const day = d.getDate();

          const timeStr = row.event_time || "";
          const parts = timeStr.split("-").map((s: string) => s.trim());
          const endTimeStr = parts[1] || parts[0] || "23:59";
          const [endH, endM] = endTimeStr
            .split(":")
            .map((num: string) => Number(num) || 0);

          const eventFinishTime = new Date(year, month, day, endH, endM, 59);

          if (now > eventFinishTime) {
            paymentStatus = "Overdue";
            paymentStatusEn = "Overdue";
          }
        }
      } catch (err) {
        console.error("Gagal kalkulasi overdue di event:", row.id);
      }

      return {
        id: row.id,
        event_name: row.event_name,
        client_name: row.client_name || "Klien Tidak Diketahui",
        client_type: row.client_type || "B2C",
        event_date: row.event_date,
        event_time: row.event_time,
        location: row.location,
        status: eventStatus,
        total_price: netTotal,
        gross_price: grossTotal,
        paid_amount: paidAmount,
        discount_amount: discountAmount,
        balance,
        payment_status: paymentStatus,
        payment_status_en: paymentStatusEn,
      };
    });

    return NextResponse.json({ status: "success", data: formattedData });
  } catch (error: any) {
    console.error(">>> ERROR DB API EVENT OWNER:", error.message);
    return NextResponse.json(
      { status: "error", message: `Detail DB: ${error.message}` },
      { status: 500 },
    );
  }
}

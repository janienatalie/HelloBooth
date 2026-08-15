// src/app/api/invoices/[id]/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 1. Ambil data Event, Klien, dan JOIN dengan tabel Invoices
    // PERBAIKAN: Kita buat WHERE clausenya bisa membaca id invoice (i.id) ATAU id event (e.id)
    const eventRes = await query(
      `SELECT 
        e.*, 
        c.name as client_name, 
        c.phone as client_phone,
        c.email as client_email,
        c.client_type,
        i.id as invoice_id,
        i.payment_status as db_payment_status,
        COALESCE(i.paid_amount, 0) as real_paid_amount,
        COALESCE(i.discount_amount, 0) as discount_amount,
        i.due_date as invoice_due_date
      FROM events e
      LEFT JOIN clients c ON e.client_id = c.id
      JOIN invoices i ON e.id = i.event_id
      WHERE i.id = $1 OR e.id = $1`,
      [id],
    );

    if (eventRes.rows.length === 0) {
      return NextResponse.json(
        { status: "error", message: "Invoice tidak ditemukan" },
        { status: 404 },
      );
    }

    const eventData = eventRes.rows[0];
    const realEventId = eventData.id; // Kunci utama: Ambil ID Event yang asli dari hasil query

    const formatIndoDate = (dateInput: any) => {
      if (!dateInput) return "-";
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };
    const formatEngDate = (dateInput: any) => {
      if (!dateInput) return "-";
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    // 2. Ambil data items (layanan & addons)
    // PERBAIKAN: Gunakan realEventId agar tabel items mau memunculkan datanya
    const itemsRes = await query(
      `SELECT * FROM event_items WHERE event_id = $1`,
      [realEventId],
    );

    const servicesRes = await query(
      `SELECT id, name, price_b2b, price_b2c FROM services`,
    );
    const addonsRes = await query(`SELECT id, name, base_price FROM addons`);

    const masterMap: Record<string, { name: string; price: number }> = {};

    const isB2B = String(eventData.client_type).toUpperCase() === "B2B";

    addonsRes.rows.forEach((item: any) => {
      masterMap[`addon_${item.id}`] = {
        name: item.name,
        price: parseFloat(item.base_price) || 0,
      };
    });

    servicesRes.rows.forEach((item: any) => {
      const fallbackPrice = isB2B
        ? parseFloat(item.price_b2b)
        : parseFloat(item.price_b2c);

      masterMap[`service_${item.id}`] = {
        name: item.name,
        price: fallbackPrice || 0,
      };
    });

    // 3. Hitung Kalkulasi Finansial
    let subtotal = 0;
    const formattedItems = itemsRes.rows.map((item: any) => {
      const typeKey = `${item.item_type?.toLowerCase() === "service" ? "service" : "addon"}_${item.item_id}`;

      const price =
        parseFloat(item.item_price) || masterMap[typeKey]?.price || 0;
      const qty = parseInt(item.quantity) || 1;

      subtotal += price * qty;
      return { desc: masterMap[typeKey]?.name || item.item_name, qty, price };
    });

    const discountAmount = parseFloat(eventData.discount_amount) || 0;
    const totalAfterDiscount = Math.max(0, subtotal - discountAmount);
    const paidAmount = parseFloat(eventData.real_paid_amount) || 0;

    let financialStatus = "Belum Dibayar";
    if (paidAmount >= totalAfterDiscount && totalAfterDiscount > 0) {
      financialStatus = "Lunas";
    } else if (paidAmount > 0) {
      financialStatus = "DP (Sebagian)";
    }

    if (financialStatus !== "Lunas" && eventData.event_date) {
      try {
        const d = new Date(eventData.event_date);
        const year = d.getFullYear();
        const month = d.getMonth();
        const day = d.getDate();

        const timeStr = eventData.event_time || "";
        const parts = timeStr.split("-").map((s: string) => s.trim());
        const endTimeStr = parts[1] || parts[0] || "23:59";
        const [endH, endM] = endTimeStr
          .split(":")
          .map((num: string) => Number(num) || 0);

        const eventFinishTime = new Date(year, month, day, endH, endM, 59);
        const now = new Date();

        if (now > eventFinishTime) {
          financialStatus = "Overdue";

          if (
            eventData.db_payment_status !== "Overdue" &&
            eventData.invoice_id
          ) {
            query(
              "UPDATE invoices SET payment_status = 'Overdue' WHERE id = $1",
              [eventData.invoice_id],
            ).catch((err: any) =>
              console.error("Gagal auto-update Overdue di detail:", err),
            );
          }
        }
      } catch (err) {
        console.error("Gagal kalkulasi overdue presisi detail:", err);
      }
    }

    const responseData = {
      id: eventData.id,
      date: {
        id: formatIndoDate(eventData.created_at || new Date()),
        en: formatEngDate(eventData.created_at || new Date()),
      },
      dueDate: formatIndoDate(
        new Date(eventData.invoice_due_date || eventData.event_date),
      ),
      status: financialStatus,
      client: {
        name: eventData.client_name,
        phone: eventData.client_phone,
        address: eventData.client_email,
      },
      event: {
        name: eventData.event_name,
        date: {
          id: formatIndoDate(eventData.event_date),
          en: formatEngDate(eventData.event_date),
        },
        location: eventData.location,
      },
      items: formattedItems,
      financial: {
        subtotal: subtotal,
        discount: discountAmount,
        total: totalAfterDiscount,
        paid: paidAmount,
        balance: Math.max(0, totalAfterDiscount - paidAmount),
      },
    };

    return NextResponse.json({ status: "success", data: responseData });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

// 2. FUNGSI PATCH: Murni Mengupdate Tabel INVOICES & Sync ke Event
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // PERBAIKAN: Cari ID Event asli sebelum melakukan update
    const checkRes = await query(
      "SELECT event_id FROM invoices WHERE id = $1 OR event_id = $1",
      [id],
    );
    if (checkRes.rows.length === 0) {
      return NextResponse.json(
        { status: "error", message: "Invoice tidak ditemukan saat update" },
        { status: 404 },
      );
    }
    const realEventId = checkRes.rows[0].event_id;

    const { paidAmount, discountAmount, subtotal } = await request.json();

    const finalTotal = Math.max(0, Number(subtotal) - Number(discountAmount));
    const inputPaidAmount = Number(paidAmount);

    let paymentStatus = "unpaid";
    if (inputPaidAmount >= finalTotal && finalTotal > 0) {
      paymentStatus = "paid";
    } else if (inputPaidAmount > 0) {
      paymentStatus = "DP";
    }

    // Gunakan realEventId untuk update
    await query(
      "UPDATE invoices SET paid_amount = $1, discount_amount = $2, total_amount = $3, payment_status = $4 WHERE event_id = $5",
      [inputPaidAmount, discountAmount, finalTotal, paymentStatus, realEventId],
    );

    if (paymentStatus === "DP" || paymentStatus === "paid") {
      await query("UPDATE events SET status = 'confirmed' WHERE id = $1", [
        realEventId,
      ]);
    }

    return NextResponse.json({
      status: "success",
      message: "Sinkronisasi berhasil",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

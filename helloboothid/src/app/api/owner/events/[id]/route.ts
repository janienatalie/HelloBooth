// src/app/api/owner/events/[id]/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    // 1. Ambil data dasar event & info klien
    const eventRes = await query(
      `
      SELECT 
        e.*, 
        c.name as client_name, 
        c.email as client_email, 
        c.phone as client_phone,
        c.client_type,
        COALESCE(i.paid_amount, 0) as paid_amount,
        COALESCE(i.discount_amount, 0) as discount_amount,
        COALESCE(i.total_amount, 0) as invoice_total_amount
      FROM events e
      LEFT JOIN clients c ON e.client_id = c.id
      LEFT JOIN invoices i ON e.id = i.event_id
      WHERE e.id = $1
    `,
      [id],
    );

    if (eventRes.rows.length === 0) {
      return NextResponse.json(
        { status: "error", message: "Event tidak ditemukan" },
        { status: 404 },
      );
    }

    const eventData = eventRes.rows[0];
    const cType = (eventData.client_type || "B2C").toUpperCase();

    // 2. Ambil data kru/freelancer
    const crewRes = await query(
      `
      SELECT f.name, f.phone, ef.assigned_role
      FROM event_freelancers ef
      JOIN freelancers f ON ef.freelancer_id = f.id
      WHERE ef.event_id = $1
    `,
      [id],
    );

    // 3. Ambil rincian item pesanan (Menggunakan SELECT * untuk melacak backdrop & notes)
    const itemsRes = await query(
      `SELECT * FROM event_items WHERE event_id = $1`,
      [id],
    );

    // 4. Ambil data master
    const servicesRes = await query(
      `SELECT id, name, price_b2b, price_b2c FROM services`,
    );
    const addonsRes = await query(`SELECT * FROM addons`);

    const priceMap: Record<string, { b2b: number; b2c: number }> = {};
    const nameMap: Record<string, string> = {};

    (servicesRes.rows || []).forEach((s) => {
      priceMap[`service_${s.id}`] = {
        b2b: parseFloat(s.price_b2b) || 0,
        b2c: parseFloat(s.price_b2c) || 0,
      };
      nameMap[`service_${s.id}`] = s.name;
    });

    (addonsRes.rows || []).forEach((a) => {
      priceMap[`addon_${a.id}`] = {
        b2b: parseFloat(a.price_b2b || a.base_price) || 0,
        b2c: parseFloat(a.price_b2c || a.base_price) || 0,
      };
      nameMap[`addon_${a.id}`] = a.name;
    });

    // 5. Kalkulasi ulang harga & Ekstraksi Backdrop / Notes
    let grossTotal = 0;

    // Backdrop sekarang diambil dari event_items, bukan lagi dari kolom event
    let finalBackdrop = "";
    let finalNotes = eventData.notes || "";

    const formattedItems = itemsRes.rows.map((item) => {
      // Skenario 1: Jika disimpan sebagai kolom di event_items
      if (item.backdrop_theme && !finalBackdrop)
        finalBackdrop = item.backdrop_theme;
      if (item.notes && !finalNotes) finalNotes = item.notes;

      // Skenario 2: Jika dipindahkan sebagai baris item baru
      const typeStrRaw = (item.item_type || "").toLowerCase().trim();
      if (typeStrRaw === "backdrop" && item.item_name)
        finalBackdrop = item.item_name;
      if ((typeStrRaw === "notes" || typeStrRaw === "note") && item.item_name)
        finalNotes = item.item_name;

      let itemPrice = parseFloat(item.item_price);
      const typeStr = typeStrRaw === "service" ? "service" : "addon";

      // Pengambilan harga dinamis divisi (B2B/B2C)
      if (!itemPrice) {
        const pMap = priceMap[`${typeStr}_${item.item_id}`];
        if (pMap) {
          itemPrice = cType === "B2B" ? pMap.b2b : pMap.b2c;
        } else {
          itemPrice = 0;
        }
      }

      const fallbackName =
        nameMap[`${typeStr}_${item.item_id}`] || "Item Tidak Diketahui";
      const rawItemName = String(item.item_name || "").trim();
      const looksGenericItem = /^item\s*\d+$/i.test(rawItemName);
      const itemName =
        rawItemName && !looksGenericItem ? rawItemName : fallbackName;

      const quantity = parseInt(item.quantity) || 1;
      const subtotal = itemPrice * quantity;
      grossTotal += subtotal;

      return {
        item_name: itemName,
        item_type: item.item_type,
        item_price: itemPrice,
        quantity,
        subtotal,
      };
    });

    // Menyembunyikan item khusus "info" dari rincian tabel tagihan jika harganya 0
    const displayItems = formattedItems.filter((item) => {
      const t = (item.item_type || "").toLowerCase().trim();
      if (
        (t === "backdrop" || t === "notes" || t === "note") &&
        item.item_price === 0
      ) {
        return false;
      }
      return true;
    });

    return NextResponse.json({
      status: "success",
      data: {
        id: eventData.id,
        event_name: eventData.event_name,
        event_date: eventData.event_date,
        event_time: eventData.event_time,
        location: eventData.location,
        status: eventData.status,
        backdrop_theme: finalBackdrop || "-",
        notes: finalNotes || "Tidak ada catatan operasional khusus.",
        invoice: {
          paid_amount: parseFloat(eventData.paid_amount) || 0,
          discount_amount: parseFloat(eventData.discount_amount) || 0,
          total_amount:
            parseFloat(eventData.invoice_total_amount) || grossTotal,
          balance: Math.max(
            0,
            (parseFloat(eventData.invoice_total_amount) || grossTotal) -
              (parseFloat(eventData.paid_amount) || 0),
          ),
        },
        client: {
          name: eventData.client_name || "Klien Tidak Diketahui",
          email: eventData.client_email || "-",
          phone: eventData.client_phone || "-",
          type: eventData.client_type || "B2C",
        },
        crew: crewRes.rows,
        items: displayItems,
        total_price: grossTotal,
        backdrop: finalBackdrop || "-",
      },
    });
  } catch (error: any) {
    console.error(">>> ERROR DB API EVENT DETAIL:", error.message);
    return NextResponse.json(
      { status: "error", message: `Detail DB: ${error.message}` },
      { status: 500 },
    );
  }
}

// src/app/api/events/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { query } from "../../../lib/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-anda",
);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    let subRole = "Admin General";
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        subRole = (payload.sub_role as string) || "Admin General";
      } catch (err) {
        console.error("JWT Verification failed", err);
      }
    }

    let clientFilterQuery = "";
    const safeRole = String(subRole).toLowerCase();

    if (safeRole.includes("b2b")) {
      clientFilterQuery = "WHERE UPPER(c.client_type) = 'B2B'";
    } else if (safeRole.includes("b2c")) {
      clientFilterQuery = "WHERE UPPER(c.client_type) = 'B2C'";
    }

    const result = await query(`
      SELECT 
        e.*, 
        c.name as client_name,
        c.client_type
      FROM events e
      LEFT JOIN clients c ON e.client_id = c.id
      ${clientFilterQuery}
      ORDER BY e.event_date DESC, e.event_time DESC
    `);

    const formattedEvents = result.rows.map((row: any) => {
      let currentStatus = (row.status || "inquiry").toLowerCase();

      if (
        (currentStatus === "inquiry" || currentStatus === "confirmed") &&
        row.event_date
      ) {
        try {
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
          const now = new Date();

          if (now > eventFinishTime) {
            currentStatus = "done";
            query("UPDATE events SET status = 'done' WHERE id = $1", [
              row.id,
            ]).catch(console.error);
          }
        } catch (err) {
          console.error("Gagal kalkulasi auto-done event:", err);
        }
      }

      return {
        ...row,
        status: currentStatus,
      };
    });

    return NextResponse.json({ status: "success", data: formattedEvents });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    let salesId = null;
    let subRole = "";

    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);

        // PERBAIKAN 1: Tangkap semua kemungkinan nama key ID dari payload JWT
        salesId = payload.id || payload.userId || payload.user_id || null;
        subRole =
          (payload.sub_role as string) || (payload.role as string) || "";
      } catch (err) {
        console.error("JWT Verification failed", err);
      }
    }

    // ==========================================================
    // VALIDASI KEAMANAN: HANYA SALES / ADMIN YANG BISA MEMBUAT EVENT
    // ==========================================================
    const safeRole = String(subRole).toLowerCase();
    if (safeRole.includes("manager")) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Akses ditolak: Event Manager tidak diizinkan membuat event baru.",
        },
        { status: 403 },
      );
    }

    const data = await request.json();
    const {
      id,
      client_id,
      event_name,
      event_date,
      event_time,
      location,
      notes,
      backdrop_theme,
      items,
    } = data;

    // VALIDASI BACKEND: CEK KAPASITAS TANGGAL
    const capacityCheck = await query(
      `SELECT COUNT(*) as total_events 
       FROM events 
       WHERE event_date = $1 
       AND LOWER(status) != 'cancelled'`,
      [event_date],
    );

    const currentEvents = parseInt(capacityCheck.rows[0].total_events);

    if (currentEvents >= 10) {
      return NextResponse.json(
        {
          status: "error",
          message: `Gagal menyimpan: Kapasitas penuh! Sudah ada 10 event yang terdaftar pada tanggal ${event_date}.`,
        },
        { status: 400 },
      );
    }

    // ==========================================================
    // PENGAMBILAN HARGA TIERING (B2B vs B2C)
    // ==========================================================

    // 1. Cek dulu klien ini tipenya apa (B2B atau B2C)
    let clientType = "B2C"; // Default aman
    const clientCheck = await query(
      `SELECT client_type FROM clients WHERE id = $1`,
      [client_id],
    );
    if (clientCheck.rows.length > 0 && clientCheck.rows[0].client_type) {
      clientType = clientCheck.rows[0].client_type.toUpperCase();
    }

    let calculatedTotalPrice = 0;
    const itemsToInsert = [];

    if (items && items.length > 0) {
      for (const item of items) {
        let exactName = item.name || item.item_name || `Item ${item.item_id}`;
        let exactPrice = Number(item.price ?? item.item_price ?? 0);
        const itemType = (
          item.item_type ||
          item.type ||
          "service"
        ).toLowerCase();

        if (itemType === "service") {
          const dbRes = await query(
            "SELECT name, price_b2b, price_b2c FROM services WHERE id::text = $1",
            [String(item.item_id)],
          );
          if (dbRes.rows.length > 0) {
            exactName = dbRes.rows[0].name;
            exactPrice =
              exactPrice ||
              (clientType === "B2B"
                ? Number(dbRes.rows[0].price_b2b || 0)
                : Number(dbRes.rows[0].price_b2c || 0));
          }
        } else if (itemType === "addon") {
          const dbRes = await query(
            "SELECT name, base_price FROM addons WHERE id = $1",
            [item.item_id],
          );
          if (dbRes.rows.length > 0) {
            exactName = dbRes.rows[0].name;
            exactPrice = exactPrice || Number(dbRes.rows[0].base_price || 0);
          }
        }

        const qty = Number(item.quantity || 1);
        calculatedTotalPrice += exactPrice * qty;

        itemsToInsert.push({
          item_id: item.item_id || "-",
          item_type: itemType,
          item_name: exactName,
          item_price: exactPrice,
          quantity: qty,
          backdrop: item.backdrop || item.backdrop_theme || null,
          notes: item.itemNotes || item.notes || null,
        });
      }
    }

    const eventId = id || `event-${Date.now()}`;

    // INSERT EVENTS
    await query(
      `INSERT INTO events 
        (id, client_id, event_name, event_date, event_time, location, total_price, status, sales_id, division) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'inquiry', $8, $9)`,
      [
        eventId,
        client_id,
        event_name,
        event_date,
        event_time,
        location,
        calculatedTotalPrice,
        salesId,
        clientType,
      ],
    );

    // INSERT INVOICES
    await query(
      `INSERT INTO invoices 
        (id, event_id, issue_date, due_date, total_amount, paid_amount, payment_status, discount_amount) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        `INV-${Date.now()}`,
        eventId,
        event_date,
        event_date,
        calculatedTotalPrice,
        0,
        "unpaid",
        0,
      ],
    );

    // INSERT EVENT ITEMS (Menyimpan backdrop dan notes spesifik)
    for (const itm of itemsToInsert) {
      await query(
        `INSERT INTO event_items (event_id, item_id, item_type, item_name, item_price, quantity, backdrop_theme, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          eventId,
          itm.item_id,
          itm.item_type,
          itm.item_name,
          itm.item_price,
          itm.quantity,
          itm.backdrop,
          itm.notes,
        ],
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Event berhasil dibuat dan di-track ke sales",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

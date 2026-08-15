// src/app/api/events/[id]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { query } from "../../../../lib/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-anda",
);

// 1. GET: Mengambil Detail Event, Data Klien, dan Daftar Kru
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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

    const eventRes = await query(
      `SELECT 
      e.*, 
      c.name AS client_name, 
      c.phone AS client_phone, 
      c.email AS client_email,
      s.name AS package_name
   FROM events e
   LEFT JOIN clients c ON e.client_id = c.id
   LEFT JOIN event_items ei ON e.id = ei.event_id AND LOWER(TRIM(ei.item_type)) = 'service'
   LEFT JOIN services s ON ei.item_id = s.id::text
   WHERE e.id = $1
   LIMIT 1`,
      [id],
    );

    if (eventRes.rows.length === 0) {
      return NextResponse.json(
        { status: "error", message: "Event tidak ditemukan" },
        { status: 404 },
      );
    }

    const itemsRes = await query(
      `SELECT ei.item_id, ei.item_type, COALESCE(s.name, ei.item_name) as item_name, ei.item_price, ei.quantity, ei.backdrop_theme as backdrop, ei.notes
       FROM event_items ei
       LEFT JOIN services s ON ei.item_id = s.id::text
       WHERE ei.event_id = $1`,
      [id],
    );

    const crewRules: Record<string, number> = {
      helloexpress: 2,
      hellophone: 1,
      hellospin: 1,
      hellomove: 3,
      helloscribble: 2,
      hellonews: 2,
      hellobox: 2,
      hellographic: 5,
    };

    let maxCrew = 0;
    const normalizeText = (text: string) =>
      (text || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    const mainPackageName = normalizeText(eventRes.rows[0].package_name);

    itemsRes.rows.forEach((item: any) => {
      if ((item.item_type || "").toLowerCase().includes("service")) {
        const qty = parseInt(item.quantity) || 1;
        const rawItemName = item.item_name || eventRes.rows[0].package_name;
        const itemName = normalizeText(rawItemName);

        let crewNeeded = 2;
        for (const [key, value] of Object.entries(crewRules)) {
          if (itemName.includes(key)) {
            crewNeeded = value;
            break;
          }
        }
        maxCrew += qty * crewNeeded;
      }
    });

    if (maxCrew === 0 && mainPackageName) {
      let crewNeeded = 2;
      for (const [key, value] of Object.entries(crewRules)) {
        if (mainPackageName.includes(key)) {
          crewNeeded = value;
          break;
        }
      }
      maxCrew = crewNeeded;
    }

    const crewRes = await query(
      `SELECT ef.id as assignment_id, 
              f.id as freelancer_id, 
              f.name, 
              ef.assigned_role, 
              f.phone 
       FROM event_freelancers ef
       JOIN freelancers f ON ef.freelancer_id = f.id
       WHERE ef.event_id = $1`,
      [id],
    );

    return NextResponse.json({
      status: "success",
      data: {
        ...eventRes.rows[0],
        items: itemsRes.rows,
        crew: crewRes.rows,
        subRole: subRole,
        maxCrew: maxCrew,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

// 2. PATCH: Update Status Event
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    const result = await query(
      "UPDATE events SET status = $1 WHERE id = $2 RETURNING *",
      [status, id],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { status: "error", message: "Gagal update: Event tidak ditemukan" },
        { status: 404 },
      );
    }

    if (status === "cancelled") {
      await query("DELETE FROM event_freelancers WHERE event_id = $1", [id]);
    }

    return NextResponse.json({
      status: "success",
      message: "Status berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

// 3. DELETE: Menghapus Event
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    let subRole = "";

    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        subRole =
          (payload.sub_role as string) || (payload.role as string) || "";
      } catch (err) {
        console.error("JWT Verification failed", err);
      }
    }

    const safeRole = String(subRole).toLowerCase();
    if (safeRole.includes("manager")) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Akses ditolak: Event Manager tidak diizinkan menghapus event.",
        },
        { status: 403 },
      );
    }

    const result = await query("DELETE FROM events WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { status: "error", message: "Gagal menghapus: Event tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Event berhasil dihapus",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

// 4. PUT: Mengupdate Data Event & Add-ons
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { client_id, event_name, event_date, event_time, location, items } =
      body;

    const currentDataRes = await query(
      `SELECT e.status, COALESCE(i.paid_amount, 0) as paid_amount 
       FROM events e 
       LEFT JOIN invoices i ON e.id = i.event_id 
       WHERE e.id = $1`,
      [id],
    );

    let newStatus = "inquiry";
    let currentPaid = 0;

    if (currentDataRes.rows.length > 0) {
      const currentStatus = (
        currentDataRes.rows[0].status || "inquiry"
      ).toLowerCase();
      currentPaid = Number(currentDataRes.rows[0].paid_amount || 0);

      if (currentStatus === "cancelled") {
        newStatus = "cancelled";
      } else {
        const d = new Date(event_date);
        const parts = event_time.split("-").map((s: string) => s.trim());
        const endTimeStr = parts[1] || parts[0] || "23:59";
        const [endH, endM] = endTimeStr
          .split(":")
          .map((num: string) => Number(num) || 0);

        const eventFinishTime = new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
          endH,
          endM,
          59,
        );
        const now = new Date();

        if (now > eventFinishTime) {
          newStatus = "done";
        } else {
          if (currentPaid > 0) {
            newStatus = "confirmed";
          } else {
            newStatus = "inquiry";
          }
        }
      }
    }

    // ==========================================================
    // PENGAMBILAN HARGA & NAMA ASLI DARI DATABASE MASTER
    // ==========================================================

    // 1. Cek tipe klien untuk menentukan harga B2B/B2C
    let clientType = "B2C";
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
            if (!exactPrice) {
              exactPrice =
                clientType === "B2B"
                  ? Number(dbRes.rows[0].price_b2b || 0)
                  : Number(dbRes.rows[0].price_b2c || 0);
            }
          }
        } else if (itemType === "addon") {
          const dbRes = await query(
            "SELECT name, base_price FROM addons WHERE id = $1",
            [item.item_id],
          );
          if (dbRes.rows.length > 0) {
            exactName = dbRes.rows[0].name;
            if (!exactPrice) {
              exactPrice = Number(dbRes.rows[0].base_price || 0);
            }
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

    // UPDATE EVENTS
    await query(
      `UPDATE events 
       SET client_id = $1, event_name = $2, event_date = $3, event_time = $4, 
           location = $5, status = $6, total_price = $7
       WHERE id = $8`,
      [
        client_id,
        event_name,
        event_date,
        event_time,
        location,
        newStatus,
        calculatedTotalPrice,
        id,
      ],
    );

    // HAPUS ITEM LAMA
    await query("DELETE FROM event_items WHERE event_id = $1", [id]);

    // MASUKKAN ITEM BARU
    for (const itm of itemsToInsert) {
      await query(
        `INSERT INTO event_items(event_id, item_id, item_type, item_name, item_price, quantity, backdrop_theme, notes) 
         VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          id,
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

    // UPDATE HARGA INVOICE
    let newInvoiceStatus = "unpaid";
    if (currentPaid >= calculatedTotalPrice && calculatedTotalPrice > 0) {
      newInvoiceStatus = "paid";
    } else if (currentPaid > 0) {
      newInvoiceStatus = "DP";
    }

    await query(
      "UPDATE invoices SET total_amount = $1, payment_status = $2 WHERE event_id = $3",
      [calculatedTotalPrice, newInvoiceStatus, id],
    );

    return NextResponse.json({
      status: "success",
      message: "Event berhasil diperbarui",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

// src/app/api/freelancers/schedules/[id]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { query } from "../../../../../lib/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-anda",
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: eventId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 },
      );
    }

    // 1. Verifikasi Token & Ambil ID Akun Login
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userIdLogin = payload.id;

    // 2. Cari ID Freelancer berdasarkan user_id
    const freelancerRes = await query(
      "SELECT id FROM freelancers WHERE user_id = $1 LIMIT 1",
      [userIdLogin],
    );
    if (freelancerRes.rows.length === 0) {
      return NextResponse.json({
        status: "success",
        data: null,
        message: "Profil freelancer belum terhubung ke akun ini.",
      });
    }
    const fId = freelancerRes.rows[0].id;

    // 3. Ambil Detail Event
    const eventRes = await query(
      `SELECT e.* FROM events e
       JOIN event_freelancers ef ON e.id = ef.event_id
       WHERE e.id = $1 AND ef.freelancer_id = $2`,
      [eventId, fId],
    );

    if (eventRes.rows.length === 0) {
      return NextResponse.json({
        status: "success",
        data: null,
        message: "Event tidak ditemukan atau bukan tugas Anda.",
      });
    }
    const dbEvent = eventRes.rows[0];

    // 4. Ambil Layanan & Add-ons dengan JOIN ke tabel services
    const itemsRes = await query(
      `
      SELECT 
        ei.item_name, 
        ei.item_type, 
        ei.quantity, 
        s.name as real_service_name
      FROM event_items ei
      LEFT JOIN services s ON (ei.item_type = 'service' AND ei.item_id = s.id::varchar)
      WHERE ei.event_id = $1
    `,
      [eventId],
    );

    const serviceItem = itemsRes.rows.find((i: any) => {
      const type = (i.item_type || "").toLowerCase().trim();
      return type === "service" || type === "paket" || type === "package";
    });

    const addonsItems = itemsRes.rows
      .filter((i: any) => {
        const type = (i.item_type || "").toLowerCase().trim();
        return type === "addon" || type === "add-on" || type === "addons";
      })
      .map((i: any) => ({
        name:
          i.item_name && i.item_name.trim() !== ""
            ? i.item_name
            : "Add-on Tambahan",
        quantity: i.quantity || 1,
      }));

    let finalServiceName = "Paket Layanan Utama";
    if (serviceItem) {
      if (serviceItem.real_service_name) {
        finalServiceName = serviceItem.real_service_name;
      } else if (serviceItem.item_name && serviceItem.item_name.trim() !== "") {
        finalServiceName = serviceItem.item_name;
      }
    }

    // 5. LOGIKA PEMISAHAN WAKTU & STATUS OTOMATIS BERBASIS WAKTU NYATA
    let startTime = dbEvent.event_time || "-";
    let endTime = "-";

    if (dbEvent.event_time && dbEvent.event_time.includes("-")) {
      const parts = dbEvent.event_time.split("-");
      startTime = parts[0].trim();
      endTime = parts[1].trim();
    }

    const now = new Date();
    let calculatedStatus = "Upcoming";

    try {
      const dateObj = new Date(dbEvent.event_date);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth();
      const day = dateObj.getDate();

      const [startH, startM] = (startTime || "00:00").split(":").map(Number);
      const [endH, endM] = (endTime || "23:59").split(":").map(Number);

      const eventStart = new Date(
        year,
        month,
        day,
        startH || 0,
        startM || 0,
        0,
      );
      const eventEnd = new Date(year, month, day, endH || 23, endM || 59, 59);

      if (now > eventEnd) {
        calculatedStatus = "Completed";
      } else if (now >= eventStart && now <= eventEnd) {
        calculatedStatus = "Ongoing";
      }
    } catch (err) {
      console.error("Gagal memproses kalkulasi waktu event:", err);
    }

    // 6. Ambil SELURUH Rekan Tim
    const partnersRes = await query(
      `SELECT f.name, f.phone, ef.assigned_role as role
       FROM event_freelancers ef
       JOIN freelancers f ON ef.freelancer_id = f.id
       WHERE ef.event_id = $1 AND ef.freelancer_id != $2
       ORDER BY ef.assigned_role ASC`,
      [eventId, fId],
    );

    const partnersList = partnersRes.rows.map((p) => {
      let pPhone = p.phone || "";
      if (pPhone.startsWith("08")) {
        pPhone = "628" + pPhone.slice(2);
      }
      return {
        name: p.name,
        role: p.role,
        phone: pPhone,
      };
    });

    // 7. KIRIM DATA KE FRONTEND
    const itemBackdropRes = await query(
      `SELECT backdrop_theme FROM event_items WHERE event_id = $1 AND backdrop_theme IS NOT NULL LIMIT 1`,
      [eventId],
    );

    const formattedData = {
      eventName: dbEvent.event_name,
      date: dbEvent.event_date,
      startTime: startTime,
      endTime: endTime,
      location: dbEvent.location,
      status: calculatedStatus, // <- Menggunakan Virtual Status terbaru
      service: finalServiceName,
      addons: addonsItems,
      notes: dbEvent.notes,
      backdrop:
        itemBackdropRes.rows[0]?.backdrop_theme || dbEvent.backdrop_theme || "",
      partners: partnersList,
      partner: partnersList.length > 0 ? partnersList[0] : null,
    };

    return NextResponse.json({ status: "success", data: formattedData });
  } catch (err: any) {
    console.error("Detail Event API Error:", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 },
    );
  }
}
// Fungsi PATCH telah dihapus secara permanen dari sini

// src/app/api/freelancers/schedules/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { query } from "../../../../lib/db";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-anda",
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const currentYear = new Date().getFullYear();
    const year = parseInt(searchParams.get("year") || String(currentYear));

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 },
      );
    }

    // 1. Verifikasi Token & Ambil ID Akun
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id;

    // 2. Cari ID Freelancer asli berdasarkan user_id login
    const freelancerRes = await query(
      "SELECT id FROM freelancers WHERE user_id = $1 LIMIT 1",
      [userId],
    );

    if (freelancerRes.rows.length === 0) {
      return NextResponse.json({ status: "success", data: [] });
    }

    const fId = freelancerRes.rows[0].id;

    // 3. Ambil data mentah jadwal dari database DENGAN FILTER TAHUN
    const schedulesRes = await query(
      `
      SELECT 
        e.id, 
        e.event_name as "eventName", 
        e.event_date as "date", 
        e.event_time as "time", 
        e.location, 
        ef.assigned_role as "role"
      FROM events e
      JOIN event_freelancers ef ON e.id = ef.event_id
      WHERE ef.freelancer_id = $1 AND EXTRACT(YEAR FROM e.event_date) = $2
      ORDER BY e.event_date DESC, e.event_time DESC
    `,
      [fId, year],
    );

    // 4. LOGIKA STATUS OTOMATIS BERBASIS TANGGAL & WAKTU (VIRTUAL)
    const now = new Date(); // Detik ini juga

    const formattedSchedules = schedulesRes.rows.map((row) => {
      let calculatedStatus = "Upcoming";

      try {
        // Ambil komponen tanggal event
        const dateObj = new Date(row.date);
        const y = dateObj.getFullYear();
        const month = dateObj.getMonth();
        const day = dateObj.getDate();

        // Pecah rentang waktu (Contoh dari database: "14:00 - 18:00")
        const timeString = row.time || "";
        const [startTime, endTime] = timeString
          .split("-")
          .map((s: string) => s.trim());

        const [startH, startM] = (startTime || "00:00").split(":").map(Number);
        const [endH, endM] = (endTime || "23:59").split(":").map(Number);

        // Gabungkan Tanggal + Jam secara presisi
        const eventStart = new Date(y, month, day, startH, startM, 0);
        const eventEnd = new Date(y, month, day, endH, endM, 59);

        // === LOGIKA KONDISI WAKTU ===
        if (now > eventEnd) {
          // Jika waktu sekarang sudah melewati batas jam selesai
          calculatedStatus = "Completed";
        } else if (now >= eventStart && now <= eventEnd) {
          // Jika waktu sekarang berada tepat di dalam rentang jam acara
          calculatedStatus = "Ongoing";
        } else {
          // Jika waktu sekarang masih sebelum jam mulai acara
          calculatedStatus = "Upcoming";
        }
      } catch (err) {
        console.error("Gagal memproses kalkulasi waktu event:", err);
      }

      return {
        ...row,
        status: calculatedStatus,
      };
    });

    return NextResponse.json({
      status: "success",
      data: formattedSchedules,
    });
  } catch (error: any) {
    console.error("Schedules API Error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// src/app/api/freelancers/dashboard/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { query } from "../../../../lib/db";

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

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userIdLogin = payload.id;

    // 1. Cari ID Freelancer
    const freelancerRes = await query(
      "SELECT id, name FROM freelancers WHERE user_id = $1 LIMIT 1",
      [userIdLogin],
    );

    if (freelancerRes.rows.length === 0) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Akun Anda belum dihubungkan ke profil freelancer oleh Admin.",
        },
        { status: 404 },
      );
    }

    const fId = freelancerRes.rows[0].id;
    const realName = freelancerRes.rows[0].name;

    // 2. Ambil SEMUA event yang ditugaskan ke Freelancer ini (Kecuali yang Batal)
    const eventsRes = await query(
      `
      SELECT 
        e.id,
        e.event_name AS "eventName",
        e.event_date AS "date",
        e.event_time AS "time",
        e.location,
        ef.assigned_role AS "role",
        e.status
      FROM events e
      JOIN event_freelancers ef
        ON e.id = ef.event_id
      WHERE ef.freelancer_id = $1
        AND LOWER(COALESCE(e.status, '')) NOT IN ('cancelled', 'batal')
        AND EXTRACT(YEAR FROM e.event_date) = $2
    `,
      [fId, year],
    );

    const now = new Date();
    let upcomingJobs = 0;
    let completedJobs = 0;
    const upcomingSchedules: any[] = [];

    // 3. Kalkulasi Kronologis Real-Time (Mendeteksi Jam & Tanggal)
    eventsRes.rows.forEach((evt: any) => {
      let isCompleted = false;

      // Jika admin sudah set manual ke 'done'
      if ((evt.status || "").toLowerCase() === "done") {
        isCompleted = true;
      }
      // Jika belum di-set done, deteksi dari batas akhir jam acaranya
      else if (evt.date) {
        const eventEndDateTime = new Date(evt.date);
        let endHour = 23;
        let endMinute = 59;

        if (evt.time && evt.time.includes("-")) {
          const parts = evt.time.split("-");
          const endTimeStr = parts[1]?.trim();
          if (endTimeStr && endTimeStr.includes(":")) {
            const [h, m] = endTimeStr.split(":").map(Number);
            if (!isNaN(h)) endHour = h;
            if (!isNaN(m)) endMinute = m;
          }
        }

        eventEndDateTime.setHours(endHour, endMinute, 59, 999);

        if (now > eventEndDateTime) {
          isCompleted = true; // Event sudah kelewat waktunya
        }
      }

      // Pisahkan ke dalam metrik yang sesuai
      if (isCompleted) {
        completedJobs++;
      } else {
        upcomingJobs++;
        upcomingSchedules.push(evt);
      }
    });

    // 4. Urutkan jadwal yang belum selesai (Upcoming) dari yang terdekat
    upcomingSchedules.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB; // ASC: Paling awal = Paling atas
    });

    // Ambil 2 teratas untuk ditampilkan di kartu jadwal terdekat
    const nearestSchedules = upcomingSchedules.slice(0, 2);

    return NextResponse.json({
      status: "success",
      data: {
        freelancerName: realName,
        metrics: { upcomingJobs, completedJobs },
        nearestSchedules,
      },
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

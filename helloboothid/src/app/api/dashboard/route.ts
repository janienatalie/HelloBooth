// src/app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { query } from "../../../lib/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-anda",
);

export async function GET(req: Request) {
  try {
    // 1. AMBIL FILTER TAHUN DARI URL (Hanya Tahun)
    const { searchParams } = new URL(req.url);
    const currentYear = new Date().getFullYear();
    const year = parseInt(searchParams.get("year") || String(currentYear));

    // 2. BACA SIAPA YANG LOGIN DARI TOKEN
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

    // 3. ATUR FILTER KLIEN BERDASARKAN ROLE
    let clientFilterQuery = "";
    let eventClientFilter = "";
    const safeRole = String(subRole).toLowerCase();

    if (safeRole.includes("b2b")) {
      clientFilterQuery = "AND UPPER(c.client_type) = 'B2B'";
      eventClientFilter =
        "AND e.client_id IN (SELECT id FROM clients WHERE UPPER(client_type) = 'B2B')";
    } else if (safeRole.includes("b2c")) {
      clientFilterQuery = "AND UPPER(c.client_type) = 'B2C'";
      eventClientFilter =
        "AND e.client_id IN (SELECT id FROM clients WHERE UPPER(client_type) = 'B2C')";
    }

    // 4. AMBIL METRIK UTAMA
    const metricsRes = await query(
      `
      SELECT 
        (SELECT COALESCE(SUM(
           CASE 
             WHEN LOWER(e.status) = 'cancelled' THEN COALESCE(i.paid_amount::numeric, 0)
             ELSE COALESCE(i.total_amount::numeric, 0)
           END
         ), 0) 
         FROM events e 
         LEFT JOIN invoices i ON e.id = i.event_id
         LEFT JOIN clients c ON e.client_id = c.id
         WHERE EXTRACT(YEAR FROM e.event_date) = $1 
         ${clientFilterQuery}
        ) as total_omzet,
         
        (SELECT COUNT(*) 
         FROM events e
         LEFT JOIN clients c ON e.client_id = c.id
         WHERE LOWER(COALESCE(e.status, 'inquiry')) NOT IN ('cancelled', 'done')
         AND EXTRACT(YEAR FROM e.event_date) = $1
         ${clientFilterQuery}
        ) as active_jobs,
        
        -- Event Selesai Tahun Ini (Untuk Card Sales)
        (SELECT COUNT(*) 
         FROM events e
         LEFT JOIN clients c ON e.client_id = c.id
         WHERE LOWER(e.status) = 'done'
         AND EXTRACT(YEAR FROM e.event_date) = $1
         ${clientFilterQuery}
        ) as completed_jobs,

        -- Event Selesai Bulan Berjalan (Untuk Card Manager)
        (SELECT COUNT(*) 
         FROM events e
         LEFT JOIN clients c ON e.client_id = c.id
         WHERE LOWER(e.status) = 'done'
         AND EXTRACT(MONTH FROM e.event_date) = EXTRACT(MONTH FROM CURRENT_DATE)
         AND EXTRACT(YEAR FROM e.event_date) = EXTRACT(YEAR FROM CURRENT_DATE)
         ${clientFilterQuery}
        ) as completed_jobs_month,

        (SELECT COUNT(id) 
         FROM clients c 
         WHERE 1=1 ${clientFilterQuery.replace("c.client_type", "client_type")}
        ) as total_clients,

        -- Event 30 Hari Ke Depan (Untuk Card Manager Metric)
        (SELECT COUNT(*) 
         FROM events e
         LEFT JOIN clients c ON e.client_id = c.id
         WHERE e.event_date >= CURRENT_DATE
         AND e.event_date <= CURRENT_DATE + INTERVAL '30 days'
         AND LOWER(COALESCE(e.status, 'inquiry')) IN ('inquiry', 'confirmed')
         ${clientFilterQuery}
        ) as upcoming_jobs,

        -- Semua Freelancer Aktif
        (SELECT COUNT(*) 
         FROM freelancers 
         WHERE LOWER(status) = 'active'
        ) as total_freelancers
    `,
      [year],
    );
    const metrics = metricsRes.rows[0];

    // 5. AGENDA EVENT MENDATANG (FOKUS 7 HARI KE DEPAN UNTUK TABEL)
    const eventsRes = await query(`
      SELECT 
        e.id, 
        c.name as "clientName", 
        e.event_name as "eventName", 
        e.event_date as date,
        e.event_time as time, 
        e.location, 
        e.status 
      FROM events e
      LEFT JOIN clients c ON e.client_id = c.id
      WHERE e.event_date >= CURRENT_DATE 
        AND e.event_date <= CURRENT_DATE + INTERVAL '7 days'
        AND LOWER(COALESCE(e.status, 'inquiry')) IN ('inquiry', 'confirmed')
        ${clientFilterQuery}
      ORDER BY e.event_date ASC, e.event_time ASC
    `);

    // 6. TREN BULANAN OMZET
    const monthlyRes = await query(
      `
      WITH months AS (SELECT generate_series(1, 12) AS month_num)
      SELECT 
        m.month_num,
        COALESCE(COUNT(e.id), 0) as jobs,
        COALESCE(SUM(
           CASE 
             WHEN LOWER(e.status) = 'cancelled' THEN COALESCE(i.paid_amount::numeric, 0)
             ELSE COALESCE(i.total_amount::numeric, 0)
           END
        ), 0) as revenue
      FROM months m
      LEFT JOIN events e ON EXTRACT(MONTH FROM e.event_date) = m.month_num 
                         AND EXTRACT(YEAR FROM e.event_date) = $1
                         AND LOWER(COALESCE(e.status, 'inquiry')) != 'cancelled'
                         ${eventClientFilter} 
      LEFT JOIN invoices i ON e.id = i.event_id
      GROUP BY m.month_num
      ORDER BY m.month_num
    `,
      [year],
    );

    const monthNames = [
      "Jan",
      "Feb",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agt",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    const monthlyData = monthlyRes.rows.map((row: any) => ({
      month: monthNames[parseInt(row.month_num) - 1],
      jobs: parseInt(row.jobs),
      revenue: parseFloat(row.revenue),
    }));

    // 7. PROPORSI PAKET TERLARIS (Satu Tahun Penuh)
    const packageRes = await query(
      `
      SELECT 
        COALESCE(s.name, ei.item_name, 'Layanan Lainnya') as name, 
        COALESCE(SUM(ei.quantity), 0) as count
      FROM event_items ei
      JOIN events e ON ei.event_id = e.id
      LEFT JOIN clients c ON e.client_id = c.id
      LEFT JOIN services s ON ei.item_id = s.id::text AND ei.item_type ILIKE '%service%'
      WHERE (ei.item_type ILIKE '%service%' 
         OR ei.item_type ILIKE '%paket%' 
         OR ei.item_type ILIKE '%layanan%')
        AND LOWER(COALESCE(e.status, 'inquiry')) != 'cancelled'
        AND EXTRACT(YEAR FROM e.event_date) = $1
        ${clientFilterQuery}
      GROUP BY COALESCE(s.name, ei.item_name, 'Layanan Lainnya')
      ORDER BY count DESC
      LIMIT 8
    `,
      [year],
    );

    // 8. KRU TERAKTIF (MURNI BERDASARKAN BULAN & TAHUN BERJALAN SAAT INI)
    const topCrewRes = await query(`
      SELECT 
        f.name, 
        f.role, 
        COUNT(ef.event_id) as jobs,
        UPPER(SUBSTRING(f.name, 1, 1)) as initial
      FROM event_freelancers ef
      JOIN freelancers f ON ef.freelancer_id = f.id
      JOIN events ev ON ef.event_id = ev.id
      WHERE EXTRACT(MONTH FROM ev.event_date) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM ev.event_date) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY f.id, f.name, f.role
      ORDER BY jobs DESC
      LIMIT 5
    `);

    return NextResponse.json({
      status: "success",
      data: {
        subRole: subRole,
        metrics: {
          totalOmzet: parseFloat(metrics.total_omzet) || 0,
          activeJobs: parseInt(metrics.active_jobs) || 0,
          completedJobs: parseInt(metrics.completed_jobs) || 0,
          completedJobsMonth: parseInt(metrics.completed_jobs_month) || 0,
          totalClients: parseInt(metrics.total_clients) || 0,
          upcomingJobs: parseInt(metrics.upcoming_jobs) || 0,
          totalFreelancers: parseInt(metrics.total_freelancers) || 0,
        },
        recentEvents: eventsRes.rows,
        monthlyData: monthlyData,
        packages: packageRes.rows.map((r: any) => ({
          name: r.name,
          count: parseInt(r.count) || 0,
        })),
        topCrew: topCrewRes.rows.map((r: any) => ({
          name: r.name,
          role: r.role || "Crew",
          jobs: parseInt(r.jobs) || 0,
          initial: r.initial,
        })),
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

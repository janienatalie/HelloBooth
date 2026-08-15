// src/app/api/owner/sales/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // 1. Tangkap parameter tahun dari URL
    const { searchParams } = new URL(req.url);
    const currentYear = new Date().getFullYear();
    const year = parseInt(searchParams.get("year") || String(currentYear));

    // 2. Terapkan filter tahun pada saat LEFT JOIN tabel events
    const salesRes = await query(
      `
      SELECT 
        u.id AS user_id,
        u.username AS user_name,
        u.sub_role AS client_type, 
        COUNT(DISTINCT e.id)::int AS total_events,
        SUM(COALESCE(i.total_amount::numeric, 0)) AS total_revenue
      FROM users u
      LEFT JOIN events e ON e.sales_id = u.id 
          AND LOWER(COALESCE(e.status, 'inquiry')) NOT IN ('cancelled', 'batal')
          AND EXTRACT(YEAR FROM e.event_date) = $1
      LEFT JOIN invoices i ON e.id = i.event_id
      WHERE u.role = 'admin' 
        AND (u.sub_role = 'Sales B2B' OR u.sub_role = 'Sales B2C')
      GROUP BY u.id, u.username, u.sub_role
    `,
      [year], // Inject parameter tahun ke $1
    );

    return NextResponse.json({
      status: "success",
      data: salesRes.rows || [],
    });
  } catch (error: any) {
    console.error(">>> ERROR DB API SALES LEADERBOARD:", error.message);
    return NextResponse.json(
      { status: "error", message: `Detail DB: ${error.message}` },
      { status: 500 },
    );
  }
}

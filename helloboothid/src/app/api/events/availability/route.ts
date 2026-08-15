// src/app/api/events/availability/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export async function GET() {
  try {
    // Gunakan fungsi TO_CHAR dari PostgreSQL agar format tanggal
    // langsung menjadi string 'YYYY-MM-DD' dan tidak terpengaruh zona waktu
    const result = await query(`
      SELECT 
        TO_CHAR(event_date, 'YYYY-MM-DD') as date_str, 
        COUNT(*) as total_booked 
      FROM events 
      WHERE LOWER(status) != 'cancelled'
      GROUP BY date_str
    `);

    // Format data menjadi { "2026-07-20": 1, "2026-07-21": 4 }
    const availabilityMap: Record<string, number> = {};

    result.rows.forEach((row) => {
      // Pastikan string tanggal ada sebelum dimasukkan ke map
      if (row.date_str) {
        availabilityMap[row.date_str] = parseInt(row.total_booked);
      }
    });

    return NextResponse.json({
      status: "success",
      data: availabilityMap,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

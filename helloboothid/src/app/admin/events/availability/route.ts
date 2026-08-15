// src/app/api/events/availability/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export async function GET() {
  try {
    // Query ini MURNI HANYA MENGHITUNG JUMLAH, tanpa melihat klien/divisi
    // Semua orang (B2B/B2C) boleh melihat hasil query ini
    const result = await query(`
      SELECT 
        event_date, 
        COUNT(*) as total_booked 
      FROM events 
      WHERE LOWER(status) != 'cancelled'
        AND event_date >= CURRENT_DATE -- Hanya hitung hari ini ke depan
      GROUP BY event_date
    `);

    // Ubah formatnya agar mudah dibaca Frontend
    // Contoh output: { "2026-07-20": 10, "2026-07-21": 4 }
    const availabilityMap: Record<string, number> = {};

    result.rows.forEach((row) => {
      // Pastikan format tanggal YYYY-MM-DD
      const dateStr = new Date(row.event_date).toISOString().split("T")[0];
      availabilityMap[dateStr] = parseInt(row.total_booked);
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

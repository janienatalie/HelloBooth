// src/app/api/owner/crew/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        id,
        name,
        role,
        email,
        phone,
        status
      FROM freelancers
      ORDER BY name ASC
    `);

    return NextResponse.json({
      status: "success",
      data: result.rows,
    });
  } catch (error: any) {
    console.error("Gagal memuat direktori kru:", error.message);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

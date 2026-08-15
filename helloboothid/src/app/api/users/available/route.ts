// src/app/api/users/available/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../../lib/db"; // Sesuaikan path import lib/db Anda

export async function GET() {
  try {
    const result = await query(`
      SELECT id, username 
      FROM users 
      WHERE role = 'freelancer' 
      AND id NOT IN (SELECT user_id FROM freelancers WHERE user_id IS NOT NULL)
    `);

    return NextResponse.json({ status: "success", data: result.rows });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

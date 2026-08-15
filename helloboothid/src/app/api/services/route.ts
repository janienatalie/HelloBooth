// src/app/api/services/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Memanggil price_b2b dan price_b2c sesuai perubahan database terbaru
    const result = await query(
      "SELECT id, name, price_b2b, price_b2c FROM services ORDER BY name ASC",
    );
    return NextResponse.json({ status: "success", data: result.rows });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

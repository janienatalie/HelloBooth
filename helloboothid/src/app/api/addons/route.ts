// src/app/api/addons/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../lib/db";

export async function GET() {
  try {
    const result = await query(
      "SELECT id, name, base_price FROM addons ORDER BY name ASC",
    );
    return NextResponse.json({ status: "success", data: result.rows });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

// TAMBAHKAN FUNGSI POST INI UNTUK MENAMBAH ADDONS
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, base_price } = body;

    // Validasi sederhana
    if (!name || base_price === undefined) {
      return NextResponse.json(
        { status: "error", message: "Nama dan Base Price wajib diisi" },
        { status: 400 },
      );
    }

    const id = `addon-${Date.now()}`;

    // Insert ke database
    await query("INSERT INTO addons(id, name, base_price) VALUES($1, $2, $3)", [
      id,
      name,
      base_price,
    ]);

    return NextResponse.json(
      {
        status: "success",
        message: "Addon berhasil ditambahkan",
        data: { id },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Gagal menambah addon:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

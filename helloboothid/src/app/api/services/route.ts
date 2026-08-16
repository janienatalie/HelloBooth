// src/app/api/services/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { nanoid } from "nanoid"; // <-- INI YANG KURANG DI FILEMU SEBELUMNYA

export const dynamic = "force-dynamic";

// GET: Mengambil semua layanan
export async function GET() {
  try {
    // Memanggil price_b2b dan price_b2c sesuai perubahan database terbaru
    const result = await query(
      "SELECT id, name, price_b2b, price_b2c FROM services ORDER BY name ASC",
    );

    // Dibungkus dengan data: { services: ... } agar seragam dengan standar API-mu
    return NextResponse.json({
      status: "success",
      data: { services: result.rows },
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

// POST: Menambahkan layanan baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, price_b2b, price_b2c } = body;

    // Pengganti Joi Validator: Validasi tipe data dan nilai minimal
    if (
      !name ||
      typeof price_b2b !== "number" ||
      typeof price_b2c !== "number" ||
      price_b2b < 0 ||
      price_b2c < 0
    ) {
      return NextResponse.json(
        {
          status: "fail",
          message:
            "Data tidak valid. Nama wajib diisi, dan harga harus berupa angka >= 0.",
        },
        { status: 400 },
      );
    }

    const id = `srv-${nanoid(16)}`;
    const dbQuery = `
      INSERT INTO services(id, name, price_b2b, price_b2c) 
      VALUES($1, $2, $3, $4) 
      RETURNING id
    `;

    const result = await query(dbQuery, [id, name, price_b2b, price_b2c]);

    return NextResponse.json(
      {
        status: "success",
        message: "Layanan berhasil ditambahkan",
        data: { serviceId: result.rows[0].id },
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: "fail", message: error.message },
      { status: 400 },
    );
  }
}

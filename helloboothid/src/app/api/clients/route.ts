// src/app/api/clients/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { query } from "../../../lib/db";
import { nanoid } from "nanoid";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-anda",
);

// Fungsi utilitas untuk memverifikasi dan mengambil data pengguna dari token
async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      subRole: (payload.sub_role as string) || "Admin General",
      username: payload.username as string,
    };
  } catch (err) {
    return null;
  }
}

// GET: Mengambil daftar klien (Mendukung filter B2B/B2C)
export async function GET() {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json(
        { status: "fail", message: "Unauthorized" },
        { status: 401 },
      );
    }

    const safeRole = String(user.subRole).toLowerCase();
    let clientFilterQuery = "";

    if (safeRole.includes("b2b")) {
      clientFilterQuery = "WHERE UPPER(c.client_type) = 'B2B'";
    } else if (safeRole.includes("b2c")) {
      clientFilterQuery = "WHERE UPPER(c.client_type) = 'B2C'";
    }

    const dbQuery = `
      SELECT 
        c.*, 
        COUNT(e.id)::int AS total_events 
      FROM clients c
      LEFT JOIN events e ON c.id = e.client_id
      ${clientFilterQuery}
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;

    const result = await query(dbQuery);

    return NextResponse.json({
      status: "success",
      data: { clients: result.rows },
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "fail", message: error.message },
      { status: 500 },
    );
  }
}

// POST: Menambahkan klien baru (Hanya untuk tim Sales)
export async function POST(req: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json(
        { status: "fail", message: "Unauthorized" },
        { status: 401 },
      );
    }

    const safeRole = String(user.subRole).toLowerCase();
    const isSales =
      safeRole.includes("sales") ||
      safeRole.includes("b2b") ||
      safeRole.includes("b2c");

    if (!isSales) {
      return NextResponse.json(
        {
          status: "fail",
          message:
            "Akses ditolak: Hanya tim Sales yang diizinkan menambahkan klien baru.",
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { name, email, phone, client_type } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { status: "fail", message: "Name, email, dan phone wajib diisi." },
        { status: 400 },
      );
    }

    // Otomatis tentukan tipe klien berdasarkan sales yang menambahkannya
    let autoClientType = "B2C";
    if (safeRole.includes("b2b")) {
      autoClientType = "B2B";
    }

    const finalClientType = client_type || autoClientType;
    const id = `cli-${nanoid(16)}`;

    const dbQuery = `
      INSERT INTO clients(id, name, email, phone, client_type) 
      VALUES($1, $2, $3, $4, $5) 
      RETURNING id
    `;
    const result = await query(dbQuery, [
      id,
      name,
      email,
      phone,
      finalClientType,
    ]);

    return NextResponse.json(
      {
        status: "success",
        message: "Client berhasil ditambahkan",
        data: { clientId: result.rows[0].id },
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: "fail", message: error.message },
      { status: 500 },
    );
  }
}

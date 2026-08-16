// src/app/api/clients/[id]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { query } from "../../../../lib/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-anda",
);

async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      subRole: (payload.sub_role as string) || "Admin General",
    };
  } catch (err) {
    return null;
  }
}

// GET: Mengambil detail klien berdasarkan ID beserta history event-nya
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json(
        { status: "fail", message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const clientQuery = `SELECT * FROM clients WHERE id = $1`;
    const clientResult = await query(clientQuery, [id]);

    if (clientResult.rows.length === 0) {
      return NextResponse.json(
        { status: "fail", message: "Klien tidak ditemukan" },
        { status: 404 },
      );
    }

    const eventsQuery = `
      SELECT id, event_name, event_date, location, status 
      FROM events 
      WHERE client_id = $1 
      ORDER BY event_date DESC
    `;
    const eventsResult = await query(eventsQuery, [id]);

    const client = clientResult.rows[0];
    client.events = eventsResult.rows;

    return NextResponse.json({
      status: "success",
      data: { client },
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "fail", message: error.message },
      { status: 500 },
    );
  }
}

// PUT: Memperbarui data klien
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json(
        { status: "fail", message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { name, email, phone, client_type } = body;

    const dbQuery = `
      UPDATE clients 
      SET name = $1, email = $2, phone = $3, client_type = COALESCE($4, client_type) 
      WHERE id = $5 
      RETURNING id
    `;
    const result = await query(dbQuery, [name, email, phone, client_type, id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Gagal memperbarui klien. Id tidak ditemukan",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Client berhasil diperbarui",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "fail", message: error.message },
      { status: 500 },
    );
  }
}

// DELETE: Menghapus data klien (Hanya untuk tim Sales)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
            "Akses ditolak: Hanya tim Sales yang diizinkan menghapus data klien.",
        },
        { status: 403 },
      );
    }

    const { id } = await params;
    const dbQuery = `DELETE FROM clients WHERE id = $1 RETURNING id`;
    const result = await query(dbQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { status: "fail", message: "Klien gagal dihapus. Id tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Client berhasil dihapus",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "fail", message: error.message },
      { status: 500 },
    );
  }
}

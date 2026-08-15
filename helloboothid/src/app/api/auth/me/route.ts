// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { query } from "../../../../lib/db"; // Pastikan path ini sesuai dengan letak folder lib/db Anda

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-anda",
);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ status: "error" }, { status: 401 });
    }

    // 1. Verifikasi Token untuk mendapatkan ID akun
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id;

    // ====================================================================
    // 2. PERBAIKAN: Tambahkan sub_role ke dalam query database!
    // ====================================================================
    const userRes = await query(
      "SELECT username, role, sub_role FROM users WHERE id = $1 LIMIT 1",
      [userId],
    );

    // Jika user tidak ditemukan di database
    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { status: "error", message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    const userRow = userRes.rows[0];

    // ====================================================================
    // 3. PERBAIKAN: Kirimkan sub_role ke frontend
    // ====================================================================
    return NextResponse.json({
      status: "success",
      data: {
        username: userRow.username,
        role: userRow.role,
        sub_role: userRow.sub_role, // <-- Ini yang sebelumnya hilang!
      },
    });
  } catch (error) {
    console.error("Error pada API /api/auth/me:", error);
    return NextResponse.json({ status: "error" }, { status: 401 });
  }
}

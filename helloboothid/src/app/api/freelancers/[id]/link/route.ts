// src/app/api/freelancers/[id]/link/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db"; // Sesuaikan path import lib/db Anda

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params; // Ini id dari tabel freelancers (misal: F-001)
    const { user_id } = await request.json(); // Ini id dari tabel users

    // Update kolom user_id di tabel freelancers
    const result = await query(
      "UPDATE freelancers SET user_id = $1 WHERE id = $2 RETURNING *",
      [user_id || null, id], // Jika user_id kosong, kita set null (unlink)
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { status: "error", message: "Freelancer tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Akun login berhasil dihubungkan!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

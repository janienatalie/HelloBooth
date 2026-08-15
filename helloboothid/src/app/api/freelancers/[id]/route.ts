// src/app/api/freelancers/[id]/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const profile = await query(
      "SELECT * FROM freelancers WHERE TRIM(id) = TRIM($1) LIMIT 1",
      [id],
    );

    if (profile.rows.length === 0) {
      return NextResponse.json(
        {
          status: "error",
          message: `Freelancer ID ${id} tidak ada di database`,
        },
        { status: 404 },
      );
    }

    const history = await query(
      `SELECT e.id as event_id, e.event_name, e.event_date, e.location, ef.assigned_role
       FROM event_freelancers ef
       JOIN events e ON ef.event_id = e.id
       WHERE TRIM(ef.freelancer_id) = TRIM($1)
       ORDER BY e.event_date DESC`,
      [id],
    );

    return NextResponse.json({
      status: "success",
      data: { ...profile.rows[0], history: history.rows },
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Server Error" },
      { status: 500 },
    );
  }
}

// --- LOGIKA BACKEND: UPDATE DATA (PUT) ---
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();
    const { name, role, email, phone, status } = body;

    const result = await query(
      `UPDATE freelancers 
       SET name = $1, role = $2, email = $3, phone = $4, status = $5 
       WHERE TRIM(id) = TRIM($6) 
       RETURNING *`,
      [name, role, email, phone, status, id],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { status: "error", message: "Gagal memperbarui: Data tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Data berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

// --- LOGIKA BACKEND: HAPUS DATA (DELETE) ---
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // 1. Dapatkan user_id dari tabel freelancers SEBELUM datanya dihapus
    const getFreelancer = await query(
      "SELECT user_id FROM freelancers WHERE TRIM(id) = TRIM($1)",
      [id],
    );

    if (getFreelancer.rows.length === 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Gagal menghapus: Data freelancer tidak ditemukan",
        },
        { status: 404 },
      );
    }

    const targetUserId = getFreelancer.rows[0].user_id;

    // 2. Hapus data utama di tabel freelancers
    // (Relasi event_freelancers akan terhapus otomatis JIKA menggunakan ON DELETE CASCADE)
    await query("DELETE FROM freelancers WHERE TRIM(id) = TRIM($1)", [id]);

    // 3. Hapus akun login di tabel users berdasarkan user_id yang didapat
    if (targetUserId) {
      await query("DELETE FROM users WHERE id = $1 AND role = 'freelancer'", [
        targetUserId,
      ]);
    }

    return NextResponse.json({
      status: "success",
      message:
        "Profil Freelancer dan Akses Login berhasil dihapus secara permanen.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

// src/app/api/freelancers/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import bcrypt from "bcrypt"; // Pastikan package 'bcrypt' atau 'bcryptjs' terinstall di package.json

// Ambil semua daftar freelancer
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const currentYear = new Date().getFullYear();
    const year = parseInt(searchParams.get("year") || String(currentYear));

    const result = await query(
      `
      SELECT
        f.*,
        COUNT(
          CASE
            WHEN EXTRACT(YEAR FROM e.event_date) = $1 THEN ef.event_id
          END
        ) AS total_jobs
      FROM freelancers f
      LEFT JOIN event_freelancers ef
        ON f.id = ef.freelancer_id
      LEFT JOIN events e
        ON ef.event_id = e.id
      GROUP BY f.id
      ORDER BY f.name ASC
      `,
      [year],
    );
    return NextResponse.json({ status: "success", data: result.rows });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

// Tambah freelancer beserta Akun Login baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, email, phone, username, password } = body;
    const flId = `fl-${Date.now()}`;

    if (!username || !password) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Username dan Password wajib diisi untuk membuat akun login kru.",
        },
        { status: 400 },
      );
    }

    // 1. Cek bentrok: Apakah username tersebut sudah dipakai orang lain di tabel users?
    const checkUser = await query("SELECT id FROM users WHERE username = $1", [
      username,
    ]);
    if (checkUser.rows.length > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: `Username "${username}" sudah terdaftar di sistem! Silakan gunakan kombinasi username lain.`,
        },
        { status: 409 },
      );
    }

    // 2. Enkripsi password menggunakan bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Simpan ke tabel users sebagai 'freelancer', lalu kembalikan ID Integer barunya
    // (Berdasarkan Source 15 baris 23, users.id bertipe Integer / SERIAL)
    const userInsert = await query(
      `INSERT INTO users (username, password, role) 
       VALUES ($1, $2, $3) 
       RETURNING id`,
      [username, hashedPassword, "freelancer"],
    );

    const newCreatedUserId = userInsert.rows[0].id;

    // 4. Masukkan data profil ke tabel freelancers dengan membawa user_id yang baru saja tercipta
    await query(
      `INSERT INTO freelancers (id, name, role, email, phone, status, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [flId, name, role, email, phone, "Active", newCreatedUserId],
    );

    return NextResponse.json({
      status: "success",
      message:
        "Freelancer dan Akun Login berhasil diciptakan secara bersamaan.",
    });
  } catch (error: any) {
    console.error("Gagal membuat Freelancer & Akun:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

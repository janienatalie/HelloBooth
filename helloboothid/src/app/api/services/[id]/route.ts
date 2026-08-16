// src/app/api/services/[id]/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../../lib/db"; // Menghapus import pool

// PUT: Memperbarui data layanan & mencatat riwayat harga
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, price_b2b, price_b2c } = body;

    // Validasi Manual (Pengganti Joi)
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

    console.log("Service: Updating Service...", id);

    // 1. Ambil data harga lama
    const selectQuery = `SELECT name, price_b2b, price_b2c FROM services WHERE id = $1`;
    const selectRes = await query(selectQuery, [id]);

    if (!selectRes.rows.length) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Gagal memperbarui layanan. Id tidak ditemukan",
        },
        { status: 404 },
      );
    }

    const old = selectRes.rows[0];

    // 2. Update data layanan baru
    const updateQuery = `
      UPDATE services 
      SET name = $1, price_b2b = $2, price_b2c = $3 
      WHERE id = $4 
      RETURNING id
    `;
    await query(updateQuery, [name, price_b2b, price_b2c, id]);
    console.log("Service: Service updated (DB).", id);

    // 3. Masukkan ke tabel riwayat harga
    const insertHistory = `
      INSERT INTO price_history_log(
        service_id, addon_id, item_name, old_price_b2b, new_price_b2b,
        old_price_b2c, new_price_b2c, old_base_price, new_base_price, changed_at
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    `;

    console.log("Service: Inserting Service history...", id);
    await query(insertHistory, [
      id,
      null,
      name,
      old.price_b2b,
      price_b2b,
      old.price_b2c,
      price_b2c,
      null,
      null,
    ]);
    console.log("Service: Service history inserted.", id);

    return NextResponse.json({
      status: "success",
      message: "Layanan berhasil diperbarui",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { status: "fail", message: error.message },
      { status: 500 },
    );
  }
}

// DELETE: Menghapus layanan
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const dbQuery = `DELETE FROM services WHERE id = $1 RETURNING id`;
    const result = await query(dbQuery, [id]);

    if (!result.rows.length) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Layanan gagal dihapus. Id tidak ditemukan",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Layanan berhasil dihapus",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "fail", message: error.message },
      { status: 500 },
    );
  }
}

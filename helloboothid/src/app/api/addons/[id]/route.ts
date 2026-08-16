// src/app/api/addons/[id]/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

// PUT: Memperbarui data addon & mencatat riwayat harga
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, base_price } = body;

    // Validasi Manual
    if (!name || typeof base_price !== "number" || base_price < 0) {
      return NextResponse.json(
        {
          status: "fail",
          message:
            "Data tidak valid. Nama wajib diisi dan base_price harus berupa angka >= 0.",
        },
        { status: 400 },
      );
    }

    console.log("Add-on: Updating Add-on...", id);

    // 1. Ambil data harga lama
    const selectQuery = `SELECT name, base_price FROM addons WHERE id = $1`;
    const selectRes = await query(selectQuery, [id]);

    if (!selectRes.rows.length) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Gagal memperbarui addon. Id tidak ditemukan",
        },
        { status: 404 },
      );
    }

    const old = selectRes.rows[0];

    // 2. Update data addon baru
    const updateQuery = `
      UPDATE addons 
      SET name = $1, base_price = $2 
      WHERE id = $3 
      RETURNING id
    `;
    await query(updateQuery, [name, base_price, id]);
    console.log("Add-on: Add-on updated (DB).", id);

    // 3. Masukkan ke tabel riwayat harga
    const insertHistory = `
      INSERT INTO price_history_log(
        service_id, addon_id, item_name, old_price_b2b, new_price_b2b,
        old_price_b2c, new_price_b2c, old_base_price, new_base_price, changed_at
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    `;

    console.log("Add-on: Inserting Add-on history...", id);
    await query(insertHistory, [
      null,
      id,
      name,
      null,
      null,
      null,
      null,
      old.base_price,
      base_price,
    ]);
    console.log("Add-on: Add-on history inserted.", id);

    return NextResponse.json({
      status: "success",
      message: "Addon diperbarui",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { status: "fail", message: error.message },
      { status: 500 },
    );
  }
}

// DELETE: Menghapus addon
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const dbQuery = `DELETE FROM addons WHERE id = $1 RETURNING id`;
    const result = await query(dbQuery, [id]);

    if (!result.rows.length) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Addon gagal dihapus. Id tidak ditemukan",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Addon dihapus",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "fail", message: error.message },
      { status: 500 },
    );
  }
}

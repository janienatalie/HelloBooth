// src/app/api/crew/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../lib/db";

export async function POST(request: Request) {
  try {
    const { event_id, freelancer_id, assigned_role } = await request.json();

    if (!event_id || !freelancer_id || !assigned_role) {
      return NextResponse.json(
        { status: "error", message: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    // 1. CEK DUPLIKASI: Apakah kru ini sudah ditugaskan di event yang sama?
    const checkExist = await query(
      "SELECT id FROM event_freelancers WHERE event_id = $1 AND freelancer_id = $2",
      [event_id, freelancer_id],
    );

    if (checkExist.rows.length > 0) {
      return NextResponse.json(
        { status: "error", message: "Kru ini sudah ditugaskan di event ini!" },
        { status: 400 },
      );
    }

    // =========================================================================
    // 2. SISTEM GEMBOK OTOMATIS: Hitung Maksimal Kuota Kru vs Kru Terisi
    // =========================================================================

    // A. Ambil data layanan (service) yang dipesan untuk menghitung maxCrew
    const itemsRes = await query(
      `SELECT item_name, quantity 
       FROM event_items 
       WHERE event_id = $1 AND LOWER(item_type) = 'service'`,
      [event_id],
    );

    // Kamus Aturan Kru Hellobooth (tanpa spasi)
    const crewRules: Record<string, number> = {
      helloexpress: 2,
      hellophone: 1,
      hellospin: 1,
      hellomove: 3,
      helloscribble: 2,
      hellonews: 2,
      hellobox: 2,
      hellographic: 5,
    };

    let maxCrew = 0;
    const normalizeText = (text: string) =>
      (text || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    // Hitung limit maksimal
    itemsRes.rows.forEach((item) => {
      const qty = parseInt(item.quantity) || 1;
      const itemName = normalizeText(item.item_name);

      let crewNeeded = 2; // Default
      for (const [key, value] of Object.entries(crewRules)) {
        if (itemName.includes(key)) {
          crewNeeded = value;
          break;
        }
      }
      maxCrew += qty * crewNeeded;
    });

    // Fallback: Jika tidak ada item terbaca, izinkan minimal 2
    if (maxCrew === 0) maxCrew = 2;

    // B. Hitung jumlah kru yang sudah masuk (terisi) saat ini
    const countCrewRes = await query(
      "SELECT COUNT(id) as total_crew FROM event_freelancers WHERE event_id = $1",
      [event_id],
    );
    const currentCrewCount = parseInt(countCrewRes.rows[0].total_crew) || 0;

    // C. BANDINGKAN: Jika sudah penuh, BLOKIR!
    if (currentCrewCount >= maxCrew) {
      return NextResponse.json(
        {
          status: "error",
          message: `Gagal menambahkan! Kuota kru untuk event ini sudah penuh (Maksimal: ${maxCrew} orang).`,
        },
        { status: 403 }, // 403 Forbidden
      );
    }
    // =========================================================================

    // 3. INSERT KE DATABASE JIKA LOLOS SEMUA PENGECEKAN
    const result = await query(
      "INSERT INTO event_freelancers (event_id, freelancer_id, assigned_role) VALUES ($1, $2, $3) RETURNING *",
      [event_id, freelancer_id, assigned_role],
    );

    return NextResponse.json({
      status: "success",
      message: "Kru berhasil ditambahkan",
      data: result.rows[0],
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { assignmentId } = await request.json();

    if (!assignmentId) {
      return NextResponse.json(
        { status: "error", message: "Assignment ID tidak ditemukan" },
        { status: 400 },
      );
    }

    const result = await query(
      "DELETE FROM event_freelancers WHERE id = $1 RETURNING *",
      [assignmentId],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { status: "error", message: "Gagal menghapus: Kru tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Kru berhasil dihapus dari event",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

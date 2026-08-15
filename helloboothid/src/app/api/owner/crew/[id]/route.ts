// src/app/api/owner/crew/[id]/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    // 1. Ambil data profil kru/freelancer
    const crewRes = await query(
      `
      SELECT * FROM freelancers WHERE id = $1
    `,
      [id],
    );

    if (crewRes.rows.length === 0) {
      return NextResponse.json(
        { status: "error", message: "Kru tidak ditemukan" },
        { status: 404 },
      );
    }

    // 2. Ambil histori event yang pernah/sedang dikerjakan oleh kru ini
    const historyRes = await query(
      `
      SELECT 
        e.id, 
        e.event_name, 
        e.event_date, 
        e.status AS event_status,
        COALESCE(i.payment_status, 'unpaid') AS payment_status,
        ef.assigned_role
      FROM event_freelancers ef
      JOIN events e ON ef.event_id = e.id
      LEFT JOIN invoices i ON e.id = i.event_id
      WHERE ef.freelancer_id = $1
      ORDER BY e.event_date DESC
    `,
      [id],
    );

    return NextResponse.json({
      status: "success",
      data: {
        ...crewRes.rows[0],
        history: historyRes.rows,
      },
    });
  } catch (error: any) {
    console.error("Gagal memuat detail kru owner:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

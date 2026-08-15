// src/app/api/invoices/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { query } from "../../../lib/db";

// Matikan cache agar data invoice selalu real-time
export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-anda",
);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    let subRole = "Admin General";
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        subRole =
          (payload.sub_role as string) ||
          (payload.role as string) ||
          "Admin General";
      } catch (err) {
        console.error("JWT Verification failed", err);
      }
    }

    const safeRole = String(subRole).toLowerCase();
    let filterQuery = "";

    // Memfilter invoice berdasarkan Role (B2B atau B2C)
    if (safeRole.includes("b2b")) {
      filterQuery = "WHERE UPPER(c.client_type) = 'B2B'";
    } else if (safeRole.includes("b2c")) {
      filterQuery = "WHERE UPPER(c.client_type) = 'B2C'";
    }

    const result = await query(`
      SELECT 
        i.id,
        i.event_id AS event_id,
        e.event_name,
        e.event_date,
        e.event_time,
        c.name AS client_name,
        i.total_amount,
        i.paid_amount,
        i.payment_status,
        e.status AS event_status
      FROM invoices i
      LEFT JOIN events e ON i.event_id = e.id
      LEFT JOIN clients c ON e.client_id = c.id
      ${filterQuery}
      ORDER BY e.event_date DESC
    `);

    // Pemrosesan data untuk dicocokkan dengan kebutuhan page.tsx
    const formattedInvoices = result.rows.map((row) => {
      const amount = Number(row.total_amount) || 0;
      const paidAmount = Number(row.paid_amount) || 0;
      const balance = amount - paidAmount;
      const isCancelled =
        (row.event_status || "").toLowerCase() === "cancelled";

      let status = "Belum Dibayar";
      let statusEn = "Unpaid";

      // 1. Cek Batal Dulu
      if (isCancelled) {
        status = "Batal";
        statusEn = "Cancelled";
      }
      // 2. Cek Lunas
      else if (paidAmount >= amount && amount > 0) {
        status = "Lunas";
        statusEn = "Paid";
      }
      // 3. Cek DP
      else if (paidAmount > 0) {
        status = "DP";
        statusEn = "Partial (DP)";
      }

      // 4. Cek Overdue Presisi dengan Jam Mulai Event
      if (status === "Belum Dibayar" || status === "DP") {
        if (row.event_date) {
          try {
            const d = new Date(row.event_date);
            const year = d.getFullYear();
            const month = d.getMonth();
            const day = d.getDate();

            const timeStr = row.event_time || "00:00";
            const parts = timeStr.split("-").map((s: string) => s.trim());
            const startTimeStr = parts[0];
            const [startH, startM] = startTimeStr
              .split(":")
              .map((num: string) => Number(num) || 0);

            const eventStartTime = new Date(
              year,
              month,
              day,
              startH,
              startM,
              0,
            );
            const now = new Date();

            if (now >= eventStartTime) {
              status = "Overdue";
              statusEn = "Overdue";
            }
          } catch (e) {
            console.error("Gagal melakukan parse waktu:", e);
          }
        }
      }

      let formattedDueDate = "-";
      if (row.event_date) {
        const d = new Date(row.event_date);
        formattedDueDate = d.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }

      return {
        id: row.id,
        eventId: row.event_id,
        eventName: row.event_name || "-",
        clientName: row.client_name || "-",
        amount,
        paidAmount,
        balance,
        dueDate: formattedDueDate,
        rawDate: row.event_date || null, // <--- TAMBAHAN KRUSIAL ANTI-BUG
        status,
        statusEn,
        isCancelled,
      };
    });

    // PERBAIKAN: Mengirimkan subRole ke Frontend
    return NextResponse.json({
      status: "success",
      data: formattedInvoices,
      subRole: subRole,
    });
  } catch (error: any) {
    console.error("Invoices API Error:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

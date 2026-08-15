// src/app/api/owner/stats/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const currentYear = new Date().getFullYear();
    const year = parseInt(searchParams.get("year") || String(currentYear));
    const channel = searchParams.get("channel") || "Semua";

    // Filter SQL Dasar untuk Divisi (Channel) -> HANYA DIPAKAI UNTUK GRAFIK PAKET
    let channelFilter = "";
    if (channel.toUpperCase() === "B2B") {
      channelFilter = " AND UPPER(c.client_type) = 'B2B'";
    } else if (channel.toUpperCase() === "B2C") {
      channelFilter = " AND UPPER(c.client_type) = 'B2C'";
    }

    // ==========================================
    // 1. QUERY UTAMA: AMBIL SEMUA DATA TANPA FILTER DIVISI DULU
    // ==========================================
    const eventsRes = await query(
      `
      SELECT 
        e.id, 
        c.client_type,
        e.status,
        e.event_date,
        e.event_time,
        COALESCE(i.paid_amount, 0) as paid_amount,
        COALESCE(i.discount_amount, 0) as discount_amount
      FROM events e
      LEFT JOIN clients c ON e.client_id = c.id
      LEFT JOIN invoices i ON e.id = i.event_id
      WHERE EXTRACT(YEAR FROM e.event_date) = $1
    `,
      [year],
    );

    const itemsRes = await query(
      `SELECT event_id, item_id, item_type, item_price, quantity FROM event_items`,
    );
    const servicesRes = await query(
      `SELECT id, price_b2b, price_b2c FROM services`,
    );
    const addonsRes = await query(`SELECT * FROM addons`);

    // Mapping Harga Master Data
    const servicePriceMap: Record<string, { b2b: number; b2c: number }> = {};
    const addonPriceMap: Record<string, { b2b: number; b2c: number }> = {};

    (servicesRes.rows || []).forEach((s) => {
      servicePriceMap[s.id] = {
        b2b: parseFloat(s.price_b2b) || 0,
        b2c: parseFloat(s.price_b2c) || 0,
      };
    });
    (addonsRes.rows || []).forEach((a) => {
      addonPriceMap[a.id] = {
        b2b: parseFloat(a.price_b2b || a.base_price) || 0,
        b2c: parseFloat(a.price_b2c || a.base_price) || 0,
      };
    });

    // Variabel untuk 6 Kartu Atas (Akan selalu All-Divisions)
    let totalRevenue = 0;
    let b2bRevenue = 0;
    let b2cRevenue = 0;
    let cashCollected = 0;
    let activeEventsCount = 0;
    let completedEventsCount = 0;

    const now = new Date();

    // Variabel untuk Grafik (Akan difilter)
    const monthlyMap = Array.from({ length: 12 }, () => ({
      jobs: 0,
      revenue: 0,
    }));

    // LOOPING EKSEKUSI
    eventsRes.rows.forEach((row) => {
      const cType = (row.client_type || "B2C").toUpperCase();

      let grossTotal = 0;
      const items = itemsRes.rows.filter((ei) => ei.event_id === row.id);

      items.forEach((item) => {
        let itemPrice = parseFloat(item.item_price);
        if (!itemPrice) {
          const typeStr = item.item_type?.toLowerCase().trim();
          if (typeStr === "service") {
            itemPrice =
              cType === "B2B"
                ? servicePriceMap[item.item_id]?.b2b || 0
                : servicePriceMap[item.item_id]?.b2c || 0;
          } else {
            itemPrice =
              cType === "B2B"
                ? addonPriceMap[item.item_id]?.b2b || 0
                : addonPriceMap[item.item_id]?.b2c || 0;
          }
        }
        grossTotal += itemPrice * (parseInt(item.quantity) || 1);
      });

      const discount = parseFloat(row.discount_amount) || 0;
      const netTotal = Math.max(0, grossTotal - discount);
      const paid = parseFloat(row.paid_amount) || 0;

      const eventStatus = (row.status || "inquiry").toLowerCase();
      const isCancelled =
        eventStatus === "cancelled" || eventStatus === "batal";

      // ==========================================
      // BAGIAN A: METRIK 6 KARTU (TIDAK ADA FILTER DIVISI)
      // ==========================================
      cashCollected += paid;

      if (!isCancelled) {
        totalRevenue += netTotal;
        if (cType === "B2B") b2bRevenue += netTotal;
        if (cType === "B2C") b2cRevenue += netTotal;

        let isCompleted = false;
        if (eventStatus === "done") isCompleted = true;
        else if (row.event_date) {
          const d = new Date(row.event_date);
          let endH = 23,
            endM = 59;
          if (row.event_time && row.event_time.includes("-")) {
            const parts = row.event_time.split("-");
            const endTimeStr = parts[1]?.trim();
            if (endTimeStr && endTimeStr.includes(":")) {
              const [h, m] = endTimeStr.split(":").map(Number);
              if (!isNaN(h)) endH = h;
              if (!isNaN(m)) endM = m;
            }
          }
          d.setHours(endH, endM, 59, 999);
          if (now > d) isCompleted = true;
        }

        if (isCompleted) completedEventsCount++;
        else activeEventsCount++;
      }

      // ==========================================
      // BAGIAN B: METRIK GRAFIK BULANAN (DIPENGARUHI FILTER DIVISI)
      // ==========================================
      const isMatchChannel =
        channel === "Semua" || cType === channel.toUpperCase();

      if (isMatchChannel && row.event_date) {
        const monthIdx = new Date(row.event_date).getMonth();
        if (!isCancelled) {
          monthlyMap[monthIdx].jobs += 1;
          monthlyMap[monthIdx].revenue += netTotal;
        } else {
          monthlyMap[monthIdx].revenue += paid;
        }
      }
    });

    const monthNamesId = [
      "Jan",
      "Feb",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agt",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    const monthlyData = monthNamesId.map((m, idx) => ({
      month: m,
      jobs: monthlyMap[idx].jobs,
      revenue: monthlyMap[idx].revenue,
    }));

    // ==========================================
    // 2. QUERY PELENGKAP (Kru, Paket, Event Mendatang)
    // ==========================================
    const crewResult = await query(
      `SELECT COUNT(*) as total_crew FROM users WHERE role = 'freelancer'`,
    );

    // KARTU KRU TERAKTIF (TIDAK DIPENGARUHI FILTER DIVISI)
    const topCrewResult = await query(
      `
      SELECT f.name, COUNT(ef.id) as job_count
      FROM event_freelancers ef
      JOIN events e ON e.id = ef.event_id
      JOIN freelancers f ON f.id = ef.freelancer_id
      LEFT JOIN clients c ON c.id = e.client_id
      WHERE EXTRACT(YEAR FROM e.event_date) = $1
        AND LOWER(COALESCE(e.status,'inquiry')) != 'cancelled'
      GROUP BY f.id, f.name
      ORDER BY job_count DESC LIMIT 5
    `,
      [year],
    );

    // GRAFIK DONAT PAKET (DIPENGARUHI FILTER DIVISI KARENA BAGIAN GRAFIK)
    const packagesRes = await query(
      `
      SELECT COALESCE(s.name, 'Layanan Lainnya') as name, COUNT(DISTINCT e.id) as count
      FROM events e
      LEFT JOIN event_items ei ON e.id = ei.event_id AND LOWER(TRIM(ei.item_type)) = 'service'
      LEFT JOIN services s ON ei.item_id = s.id::text
      LEFT JOIN clients c ON c.id = e.client_id
      WHERE EXTRACT(YEAR FROM e.event_date) = $1
        AND LOWER(COALESCE(e.status, 'inquiry')) != 'cancelled'
        ${channelFilter}
      GROUP BY s.name ORDER BY count DESC
    `,
      [year],
    );

    // KARTU AGENDA MENDATANG (TIDAK DIPENGARUHI FILTER DIVISI)
    const recentRes = await query(`
      SELECT e.id, e.event_name as "eventName", c.name as "clientName", e.event_date as date, e.location, e.status
      FROM events e
      LEFT JOIN clients c ON e.client_id = c.id
      WHERE e.event_date >= CURRENT_DATE 
        AND e.event_date <= CURRENT_DATE + INTERVAL '7 days'
        AND LOWER(COALESCE(e.status, 'inquiry')) NOT IN ('cancelled', 'batal')
      ORDER BY e.event_date ASC 
      LIMIT 10
    `);

    // ==========================================
    // RENDER RESPONSE
    // ==========================================
    const statsData = {
      totalRevenue,
      b2bRevenue,
      b2cRevenue,
      cashCollected,
      totalEvents: activeEventsCount,
      completedEvents: completedEventsCount,
      totalCrew: parseInt(crewResult.rows[0].total_crew, 10),
      topCrew: topCrewResult.rows, // Menampilkan kru B2B+B2C
      monthlyData, // Difilter sesuai Divisi
      packages: packagesRes.rows.map((r: any) => ({
        // Difilter sesuai Divisi
        name: r.name,
        count: Number(r.count),
      })),
      recentEvents: recentRes.rows, // Menampilkan agenda B2B+B2C
    };

    return NextResponse.json({ status: "success", data: statsData });
  } catch (error: any) {
    console.error("Owner Stats Error:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

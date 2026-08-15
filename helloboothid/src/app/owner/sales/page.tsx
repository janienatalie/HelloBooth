// src/app/owner/sales/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Search,
  Medal,
  TrendingUp,
  Briefcase,
  Award,
  Users,
  Calendar,
} from "lucide-react";
import { useLanguage } from "@/providers/AppProvider";

interface SalesData {
  user_id: string;
  user_name: string;
  client_type: string;
  total_revenue: number;
  total_events: number;
}

export default function SalesLeaderboardPage() {
  const { lang } = useLanguage();
  const [leaderboard, setLeaderboard] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("All");

  // Filter Tahun
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const years = Array.from(
    { length: currentYear - 2023 + 2 },
    (_, i) => 2024 + i,
  );

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/owner/sales?year=${selectedYear}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            `API Error (${res.status}): ${errData.message || "Gagal memuat API"}`,
          );
        }
        const json = await res.json();
        if (json.status === "success") {
          const sortedData = (json.data || []).sort(
            (a: SalesData, b: SalesData) => b.total_revenue - a.total_revenue,
          );
          setLeaderboard(sortedData);
        }
      } catch (error: any) {
        console.error("Error memuat leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, [selectedYear]);

  const t = {
    id: {
      title: "Papan Peringkat Sales",
      subtitle:
        "Pantau performa omzet dan total event dari tim sales (Admin B2B/B2C).",
      searchPlaceholder: "Cari nama sales...",
      allDivisions: "Semua Divisi",
      colRank: "Peringkat",
      colName: "Nama Sales",
      colEvents: "Total Event",
      colRevenue: "Total Omzet",
      loading: "Mengkalkulasi peringkat sales...",
      noData: "Belum ada data penjualan yang tercatat di tahun ini.",
      rankLabel: "PERINGKAT",
      revenueGenerated: "Total Pendapatan",
    },
    en: {
      title: "Sales Leaderboard",
      subtitle:
        "Monitor the revenue performance and total events of the sales team.",
      searchPlaceholder: "Search sales name...",
      allDivisions: "All Divisions",
      colRank: "Rank",
      colName: "Sales Name",
      colEvents: "Total Events",
      colRevenue: "Total Revenue",
      loading: "Calculating sales rankings...",
      noData: "No sales data recorded yet for this year.",
      rankLabel: "RANK",
      revenueGenerated: "Revenue Generated",
    },
  }[lang === "id" ? "id" : "en"];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val || 0);
  };

  const filteredLeaderboard = leaderboard.filter((sales) => {
    const nameMatch = (sales.user_name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const typeVal = (sales.client_type || "").toUpperCase();
    const matchDiv =
      divisionFilter === "All" || typeVal.includes(divisionFilter);

    return nameMatch && matchDiv;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium text-sm">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* HEADER dengan FILTER TAHUN SERAGAM DENGAN DASHBOARD */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-yellow-500 drop-shadow-sm" />
            {t.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl shadow-sm hover:border-primary/50 transition-colors">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FILTER KONTROL TABEL (Cari & Divisi) */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm transition-colors">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-colors"
          />
        </div>

        <div className="flex w-full sm:w-auto">
          <div className="relative flex items-center w-full sm:w-auto">
            <div className="absolute left-3 text-slate-400 pointer-events-none">
              <Users className="w-4 h-4" />
            </div>
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer shadow-sm transition-colors appearance-none"
            >
              <option value="All">{t.allDivisions}</option>
              <option value="B2B">Sales B2B</option>
              <option value="B2C">Sales B2C</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABEL LEADERBOARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center w-24">
                  {t.colRank}
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.colName}
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  {t.colEvents}
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                  {t.colRevenue}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaderboard.length > 0 ? (
                filteredLeaderboard.map((sales, index) => {
                  const rank = index + 1;
                  const isB2B = (sales.client_type || "")
                    .toUpperCase()
                    .includes("B2B");

                  let rankStyle = "text-slate-500 font-bold text-lg";
                  let rowStyle =
                    "hover:bg-slate-50/80 dark:hover:bg-slate-800/30";
                  let Icon = undefined;

                  if (sales.total_revenue > 0) {
                    if (rank === 1) {
                      rankStyle =
                        "text-yellow-500 font-black text-2xl drop-shadow-sm";
                      rowStyle =
                        "bg-yellow-50/30 dark:bg-yellow-500/5 hover:bg-yellow-50/50 dark:hover:bg-yellow-500/10 border-l-4 border-l-yellow-400";
                      Icon = Award;
                    } else if (rank === 2) {
                      rankStyle =
                        "text-slate-400 font-black text-xl drop-shadow-sm";
                      rowStyle =
                        "bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-100 dark:hover:bg-slate-800/40 border-l-4 border-l-slate-300";
                      Icon = Medal;
                    } else if (rank === 3) {
                      rankStyle =
                        "text-amber-600 font-black text-xl drop-shadow-sm";
                      rowStyle =
                        "bg-amber-50/30 dark:bg-amber-500/5 hover:bg-amber-50/50 dark:hover:bg-amber-500/10 border-l-4 border-l-amber-500";
                      Icon = Medal;
                    }
                  }

                  return (
                    <tr
                      key={`sales-row-${sales.user_id}-${index}`}
                      className={`border-b border-slate-100 dark:border-slate-800/50 transition-all ${rowStyle}`}
                    >
                      {/* PERINGKAT */}
                      <td className="py-5 px-6 text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                          {Icon ? (
                            <>
                              <Icon className={`w-6 h-6 ${rankStyle}`} />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                {t.rankLabel} {rank}
                              </span>
                            </>
                          ) : (
                            <span className={rankStyle}>#{rank}</span>
                          )}
                        </div>
                      </td>

                      {/* NAMA SALES & DIVISI */}
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                              rank === 1 && sales.total_revenue > 0
                                ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400"
                                : rank === 2 && sales.total_revenue > 0
                                  ? "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                  : rank === 3 && sales.total_revenue > 0
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-500"
                                    : "bg-primary/10 text-primary dark:bg-primary/20"
                            }`}
                          >
                            {(sales.user_name || "A").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white text-base capitalize">
                              {sales.user_name}
                            </p>
                            <span
                              className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                isB2B
                                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                                  : "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
                              }`}
                            >
                              {sales.client_type || "Admin Sales"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* TOTAL EVENT */}
                      <td className="py-5 px-6 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-mono text-sm font-bold">
                          <Briefcase className="w-4 h-4 text-slate-400" />
                          {sales.total_events}
                        </div>
                      </td>

                      {/* TOTAL OMZET */}
                      <td className="py-5 px-6 text-right">
                        <div className="flex flex-col items-end">
                          <p
                            className={`font-mono text-lg font-black tracking-tight ${
                              rank === 1 && sales.total_revenue > 0
                                ? "text-yellow-600 dark:text-yellow-400"
                                : sales.total_revenue === 0
                                  ? "text-slate-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {formatRupiah(sales.total_revenue)}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <TrendingUp className="w-3 h-3" />
                            {t.revenueGenerated}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-16 text-center text-slate-500 italic"
                  >
                    <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3 opacity-50" />
                    {t.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

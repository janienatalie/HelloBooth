// src/app/admin/invoices/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  ChevronRight,
  ChevronLeft,
  Filter,
  ArrowUpDown,
  XCircle,
  Calendar,
} from "lucide-react";
import { useLanguage } from "@/providers/AppProvider";

export default function InvoicesPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  // ================= STATE FILTERS =================
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [sortBalance, setSortBalance] = useState<"desc" | "asc" | null>(null);

  // PERBAIKAN: Bulan sekarang disimpan dalam wujud Indeks String ("0" - "11") atau "Semua"
  const [selectedMonth, setSelectedMonth] = useState("Semua");
  const [selectedYear, setSelectedYear] = useState("Semua");

  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Daftar nama bulan
  const monthsId = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const monthsEn = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const activeMonthsList = lang === "id" ? monthsId : monthsEn;

  // Catatan: useEffect "Sync Language" yang sebelumnya kita hapus karena
  // karena state filter "selectedMonth" kini berbasis angka dan kebal terhadap perubahan bahasa.

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/invoices");
        const json = await res.json();

        if (json.status === "success") {
          setInvoices(json.data);

          // LOGIKA DINAMIS PENGATURAN DEFAULT FILTER
          const safeRole = String(json.subRole || "").toLowerCase();

          if (safeRole.includes("manager")) {
            // Event Manager: Aktifkan Filter ke Bulan & Tahun Berjalan
            // PERBAIKAN: Langsung simpan wujud "Angka Indeks"-nya
            const currentMonthIdxStr = new Date().getMonth().toString();
            const currentYearStr = new Date().getFullYear().toString();

            setSelectedMonth(currentMonthIdxStr);
            setSelectedYear(currentYearStr);
          } else {
            // Sales / Lainnya: Tampilkan Semua Invoice
            setSelectedMonth("Semua");
            setSelectedYear("Semua");
          }
        }
      } catch (error) {
        console.error("Gagal memuat data invoice:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  // Reset ke halaman 1 jika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedMonth, selectedYear, itemsPerPage]);

  const t = {
    id: {
      title: "Manajemen Invoice & Kas",
      subtitle:
        "Pantau tagihan klien, status pembayaran DP/Pelunasan, dan ringkasan pendapatan.",
      searchPlaceholder: "Cari no. invoice, nama event, atau klien...",
      filterStatus: "Semua Status",
      filterMonthAll: "Semua Bulan",
      filterYearAll: "Semua Tahun",
      cardTotal: "Total Uang Masuk",
      cardPending: "Menunggu Pembayaran (Piutang)",
      cardOverdue: "Terlambat / Jatuh Tempo",
      colInvoice: "No. Invoice / Klien",
      colAmount: "Total Tagihan",
      colDueDate: "Jatuh Tempo",
      colStatus: "Status Keuangan",
      colAction: "Aksi",
      viewDetail: "Lihat Detail",
      noData: "Tidak ada data invoice yang ditemukan.",
      remBalance: "Sisa",
      cancelledTag: "BATAL",
      rowsPerPage: "Data per halaman",
      showing: "Menampilkan",
      to: "hingga",
      of: "dari",
      entries: "entri",
      prev: "Sebelumnya",
      next: "Berikutnya",
    },
    en: {
      title: "Invoice & Cash Management",
      subtitle:
        "Track client billing, DP/Full payment status, and revenue summary.",
      searchPlaceholder: "Search invoice no, event name, or client...",
      filterStatus: "All Status",
      filterMonthAll: "All Months",
      filterYearAll: "All Years",
      cardTotal: "Total Revenue",
      cardPending: "Pending Payment",
      cardOverdue: "Overdue",
      colInvoice: "Invoice No / Client",
      colAmount: "Total Amount",
      colDueDate: "Due Date",
      colStatus: "Financial Status",
      colAction: "Action",
      viewDetail: "View Detail",
      noData: "No invoice data found.",
      remBalance: "Remains",
      cancelledTag: "CANCELLED",
      rowsPerPage: "Rows per page",
      showing: "Showing",
      to: "to",
      of: "of",
      entries: "entries",
      prev: "Previous",
      next: "Next",
    },
  }[lang === "id" ? "id" : "en"];

  // ========================================================
  // HELPER: Ekstraksi Bulan & Tahun Menggunakan Data Mentah
  // ========================================================
  const getMonthAndYear = (rawDate: string | null) => {
    if (!rawDate) return { monthIdx: -1, year: "-" };
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return { monthIdx: -1, year: "-" };
    return { monthIdx: d.getMonth(), year: d.getFullYear().toString() };
  };

  const currentYearStr = new Date().getFullYear().toString();
  const availableYears = Array.from(
    new Set(invoices.map((inv) => getMonthAndYear(inv.rawDate).year)),
  )
    .filter((y) => y !== "-")
    .sort((a, b) => Number(b) - Number(a));

  if (!availableYears.includes(currentYearStr)) {
    availableYears.push(currentYearStr);
    availableYears.sort((a, b) => Number(b) - Number(a));
  }

  // ========================================================
  // FILTERING LAPIS 1: Waktu (Bulan & Tahun) - ANTI BENTROK
  // ========================================================
  const timeFilteredInvoices = invoices.filter((inv) => {
    const { monthIdx, year } = getMonthAndYear(inv.rawDate);

    let matchMonth = false;
    if (selectedMonth === "Semua") {
      matchMonth = true;
    } else {
      // PERBAIKAN: Membandingkan secara langsung dengan Index Angka.
      if (monthIdx === parseInt(selectedMonth, 10)) {
        matchMonth = true;
      }
    }

    const matchYear = selectedYear === "Semua" || year === selectedYear;

    return matchMonth && matchYear;
  });

  // KALKULASI HEADER CARD
  const totalRevenue = timeFilteredInvoices.reduce(
    (acc, curr) => acc + (curr.paidAmount || 0),
    0,
  );

  const totalPending = timeFilteredInvoices
    .filter((inv) => !inv.isCancelled)
    .reduce((acc, curr) => acc + (curr.balance || 0), 0);

  const totalOverdue = timeFilteredInvoices
    .filter((inv) => inv.status === "Overdue")
    .reduce((acc, curr) => acc + (curr.balance || 0), 0);

  // ========================================================
  // FILTERING LAPIS 2: Search & Status
  // ========================================================
  let processedInvoices = timeFilteredInvoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      (inv.id?.toLowerCase() || "").includes(q) ||
      (inv.clientName?.toLowerCase() || "").includes(q) ||
      (inv.eventName?.toLowerCase() || "").includes(q);

    const isAllStatus = selectedStatus === "Semua" || selectedStatus === "All";
    const matchStatus = isAllStatus || inv.status === selectedStatus;

    return matchSearch && matchStatus;
  });

  // LOGIKA SORTING
  if (sortBalance !== null) {
    processedInvoices.sort((a, b) => {
      if (sortBalance === "desc") return (b.balance || 0) - (a.balance || 0);
      return (a.balance || 0) - (b.balance || 0);
    });
  }

  // --- LOGIKA PAGINATION ---
  const totalItems = processedInvoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = processedInvoices.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleSortToggle = () => {
    if (sortBalance === null) setSortBalance("desc");
    else if (sortBalance === "desc") setSortBalance("asc");
    else setSortBalance(null);
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center text-slate-500 font-semibold animate-pulse">
        Merekap Data Finansial...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          {t.title}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.subtitle}
        </p>
      </div>

      {/* HEADER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.cardTotal}
            </p>
            <p className="text-2xl font-black text-green-500">
              {formatRupiah(totalRevenue)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.cardPending}
            </p>
            <p className="text-2xl font-black text-orange-400">
              {formatRupiah(totalPending)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.cardOverdue}
            </p>
            <p className="text-2xl font-black text-rose-600">
              {formatRupiah(totalOverdue)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* FILTER BULAN & TAHUN */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex items-center gap-2 w-full">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full sm:w-36 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-300"
              >
                <option value="Semua">{t.filterMonthAll}</option>
                {/* PERBAIKAN: Option Value di-set menjadi Angka Indeks ("0" untuk Januari, dsb.) */}
                {activeMonthsList.map((m, idx) => (
                  <option key={idx} value={idx.toString()}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full sm:w-32 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-300"
              >
                <option value="Semua">{t.filterYearAll}</option>
                {availableYears.map((y, idx) => (
                  <option key={idx} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* FILTER STATUS */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-300"
            >
              <option value="Semua">{t.filterStatus}</option>
              <option value="Lunas">{lang === "id" ? "Lunas" : "Paid"}</option>
              <option value="DP">
                {lang === "id" ? "DP (Sebagian)" : "Partial (DP)"}
              </option>
              <option value="Belum Dibayar">
                {lang === "id" ? "Belum Dibayar" : "Unpaid"}
              </option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* PENCARIAN */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
          />
        </div>
      </div>

      {/* TABLE WRAPPER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {t.colInvoice}
                </th>
                <th
                  className="py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors group select-none"
                  onClick={handleSortToggle}
                >
                  <div className="flex items-center gap-1.5">
                    {t.colAmount}
                    <ArrowUpDown
                      className={`w-3.5 h-3.5 ${sortBalance ? "text-primary" : "text-slate-400 group-hover:text-slate-600"}`}
                    />
                  </div>
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {t.colDueDate}
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {t.colStatus}
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400 text-right">
                  {t.colAction}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedInvoices.length > 0 ? (
                paginatedInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => router.push(`/admin/invoices/${inv.id}`)}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all cursor-pointer group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-primary transition-colors">
                              {inv.eventName}
                            </p>
                            {inv.isCancelled && (
                              <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider flex items-center gap-0.5">
                                <XCircle className="w-2.5 h-2.5" />{" "}
                                {t.cancelledTag}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[200px]">
                            {inv.clientName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                        {formatRupiah(inv.amount)}
                      </p>
                      {!inv.isCancelled &&
                        inv.balance > 0 &&
                        inv.balance < inv.amount && (
                          <p className="text-[10.5px] font-bold text-amber-600 dark:text-amber-500 mt-0.5 flex items-center gap-1">
                            {t.remBalance}: {formatRupiah(inv.balance)}
                          </p>
                        )}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400 font-medium font-mono">
                      {inv.dueDate}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          inv.status === "Lunas"
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200"
                            : inv.status === "DP"
                              ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-200"
                              : inv.status === "Overdue"
                                ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 border-rose-200"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 border-slate-200"
                        }`}
                      >
                        {inv.status === "Lunas" && (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        {lang === "id" ? inv.status : inv.statusEn}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="inline-flex items-center gap-1 text-primary hover:text-primary-hover font-semibold text-sm transition-colors">
                        <span>{t.viewDetail}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    <p className="font-medium">{t.noData}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- KONTROL PAGINATION --- */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{t.rowsPerPage}:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-primary/50"
            >
              {[5, 10, 25, 50].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.showing} {totalItems === 0 ? 0 : startIndex + 1} {t.to}{" "}
            {Math.min(startIndex + itemsPerPage, totalItems)} {t.of}{" "}
            {totalItems} {t.entries}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              title={t.prev}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold px-2 text-slate-700 dark:text-slate-300">
              {totalPages === 0 ? 0 : currentPage} / {totalPages || 1}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              title={t.next}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

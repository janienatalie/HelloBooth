// src/app/owner/events/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Search,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Calendar as CalendarIcon,
  X,
  Banknote,
  CalendarClock,
  ChevronRight,
  ChevronLeft,
  Users,
} from "lucide-react";
import { useLanguage } from "@/providers/AppProvider";

interface EventData {
  id: string;
  event_name: string;
  client_name: string;
  client_type?: string;
  event_date: string;
  event_time: string;
  location: string;
  total_price: number;
  paid_amount: number;
  status: string;
  payment_status: string;
  payment_status_en?: string;
}

// HELPER: Menghitung status fisik kronologis acara secara Real-Time
function getEventChronologicalStatus(
  event: EventData,
): "upcoming" | "ongoing" | "completed" | "canceled" {
  if (
    (event.status || "").toLowerCase() === "cancelled" ||
    (event.status || "").toLowerCase() === "batal"
  ) {
    return "canceled";
  }

  if ((event.status || "").toLowerCase() === "done") {
    return "completed";
  }

  const now = new Date();
  if (!event.event_date) return "upcoming";

  const eventDate = new Date(event.event_date);
  if (isNaN(eventDate.getTime())) return "upcoming";

  let startHour = 0;
  let startMinute = 0;
  let endHour = 23;
  let endMinute = 59;

  if (event.event_time && event.event_time.includes("-")) {
    const parts = event.event_time.split("-").map((p) => p.trim());

    if (parts[0] && parts[0].includes(":")) {
      const [h, m] = parts[0].split(":").map(Number);
      if (!isNaN(h)) startHour = h;
      if (!isNaN(m)) startMinute = m;
    }

    if (parts[1] && parts[1].includes(":")) {
      const [h, m] = parts[1].split(":").map(Number);
      if (!isNaN(h)) endHour = h;
      if (!isNaN(m)) endMinute = m;
    }
  }

  const startDateTime = new Date(eventDate);
  startDateTime.setHours(startHour, startMinute, 0, 0);

  const endDateTime = new Date(eventDate);
  endDateTime.setHours(endHour, endMinute, 59, 999);

  if (now < startDateTime) return "upcoming";
  if (now >= startDateTime && now <= endDateTime) return "ongoing";
  return "completed";
}

export default function OwnerEventsPage() {
  const { lang } = useLanguage();
  const router = useRouter();

  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  // --- STATE RENTANG TANGGAL ---
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const [paymentFilter, setPaymentFilter] = useState("All");
  const [eventStatusFilter, setEventStatusFilter] = useState("All");
  const [clientTypeFilter, setClientTypeFilter] = useState("All");

  // --- STATE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/owner/events", { cache: "no-store" });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            `API Error (${res.status}): ${errData.message || "Cek terminal server VSCode/CMD"}`,
          );
        }
        const json = await res.json();
        if (json.status === "success") setEvents(json.data);
      } catch (error: any) {
        console.error("Gagal memuat data event owner:", error);
        alert(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    paymentFilter,
    eventStatusFilter,
    clientTypeFilter,
    startDateFilter,
    endDateFilter,
    itemsPerPage,
  ]);

  const t = {
    id: {
      title: "Laporan & Manajemen Event",
      subtitle:
        "Pantau seluruh status operasional, jadwal booking, dan nilai transaksi event.",
      searchPlaceholder: "Cari nama event atau klien...",
      allPaymentStatus: "Semua Pembayaran",
      allEventStatus: "Semua Pelaksanaan",
      allDivisions: "Semua Divisi",
      colEvent: "Nama Event / Klien",
      colSchedule: "Jadwal & Lokasi",
      colPrice: "Total Harga",
      colPaymentStatus: "Status Pembayaran",
      colEventStatus: "Status Pelaksanaan",
      loading: "Memuat data laporan event...",
      noData: "Tidak ada riwayat atau agenda event yang ditemukan.",
      viewDetail: "Detail",
      paidLabel: "Dibayar",
      paymentStatus: {
        paid: "Lunas",
        dp: "DP",
        unpaid: "Belum Dibayar",
        overdue: "Overdue",
      },
      eventStatus: {
        upcoming: "Akan Datang",
        ongoing: "Berlangsung",
        completed: "Selesai",
        canceled: "Dibatalkan",
      },
      rowsPerPage: "Data per halaman",
      showing: "Menampilkan",
      to: "hingga",
      of: "dari",
      entries: "entri",
      prev: "Sebelumnya",
      next: "Berikutnya",
    },
    en: {
      title: "Event Reports & Monitoring",
      subtitle:
        "Monitor all operational statuses, booking schedules, and event transaction values.",
      searchPlaceholder: "Search event or client name...",
      allPaymentStatus: "All Payments",
      allEventStatus: "All Execution",
      allDivisions: "All Divisions",
      colEvent: "Event Name / Client",
      colSchedule: "Schedule & Location",
      colPrice: "Total Price",
      colPaymentStatus: "Payment Status",
      colEventStatus: "Execution Status",
      loading: "Loading event report data...",
      noData: "No event history or agenda found.",
      viewDetail: "Detail",
      paidLabel: "Paid",
      paymentStatus: {
        paid: "Paid",
        dp: "DP",
        unpaid: "Unpaid",
        overdue: "Overdue",
      },
      eventStatus: {
        upcoming: "Upcoming",
        ongoing: "Ongoing",
        completed: "Completed",
        canceled: "Canceled",
      },
      rowsPerPage: "Rows per page",
      showing: "Showing",
      to: "to",
      of: "of",
      entries: "entries",
      prev: "Previous",
      next: "Next",
    },
  }[lang === "id" ? "id" : "en"];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getPaymentStyle = (s: string) => {
    switch ((s || "").toLowerCase()) {
      case "lunas":
      case "paid":
        return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200";
      case "dp":
        return "bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-200";
      case "overdue":
        return "bg-rose-50 dark:bg-rose-500/10 text-rose-600 border-rose-200";
      default:
        return "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400";
    }
  };

  const getEventStatusConfig = (
    eventStatus: "upcoming" | "ongoing" | "completed" | "canceled",
  ) => {
    switch (eventStatus) {
      case "upcoming":
        return {
          label: t.eventStatus.upcoming,
          className:
            "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
          icon: <CalendarClock className="w-3.5 h-3.5" />,
        };
      case "ongoing":
        return {
          label: t.eventStatus.ongoing,
          className:
            "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
        };
      case "completed":
        return {
          label: t.eventStatus.completed,
          className:
            "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case "canceled":
        return {
          label: t.eventStatus.canceled,
          className:
            "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
          icon: <XCircle className="w-3.5 h-3.5" />,
        };
    }
  };

  const filteredEvents = events.filter((evt) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (evt.event_name?.toLowerCase() || "").includes(q) ||
      (evt.client_name?.toLowerCase() || "").includes(q);

    const paymentVal = (evt.payment_status_en || "").toLowerCase();
    const matchesPayment =
      paymentFilter === "All" || paymentVal === paymentFilter.toLowerCase();

    const typeVal = (evt.client_type || "").toUpperCase();
    const matchesClientType =
      clientTypeFilter === "All" || typeVal === clientTypeFilter;

    const chronoStatus = getEventChronologicalStatus(evt);
    const matchesEventStatus =
      eventStatusFilter === "All" || chronoStatus === eventStatusFilter;

    // --- LOGIKA FILTER RENTANG TANGGAL ---
    let matchesDate = true;
    if (startDateFilter || endDateFilter) {
      if (evt.event_date) {
        const eventDateRaw = new Date(evt.event_date);
        if (!isNaN(eventDateRaw.getTime())) {
          const evY = eventDateRaw.getFullYear();
          const evM = String(eventDateRaw.getMonth() + 1).padStart(2, "0");
          const evD = String(eventDateRaw.getDate()).padStart(2, "0");
          const eventDateStr = `${evY}-${evM}-${evD}`;

          if (startDateFilter && endDateFilter) {
            matchesDate =
              eventDateStr >= startDateFilter && eventDateStr <= endDateFilter;
          } else if (startDateFilter) {
            matchesDate = eventDateStr >= startDateFilter;
          } else if (endDateFilter) {
            matchesDate = eventDateStr <= endDateFilter;
          }
        } else {
          matchesDate = false;
        }
      } else {
        matchesDate = false;
      }
    }

    return (
      matchesSearch &&
      matchesPayment &&
      matchesEventStatus &&
      matchesClientType &&
      matchesDate
    );
  });

  const totalItems = filteredEvents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

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
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" /> {t.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col gap-4 transition-colors">
        {/* BARIS 1: PENCARIAN (FULL WIDTH) */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-colors"
          />
        </div>

        {/* BARIS 2: SEMUA FILTER BERJAJAR */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* FILTER DIVISI (B2B/B2C) */}
          <div className="relative flex items-center w-full sm:w-auto flex-1 sm:flex-none">
            <div className="absolute left-3 text-slate-400 pointer-events-none">
              <Users className="w-4 h-4" />
            </div>
            <select
              value={clientTypeFilter}
              onChange={(e) => setClientTypeFilter(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-6 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-colors appearance-none"
            >
              <option value="All">{t.allDivisions}</option>
              <option value="B2B">Divisi B2B</option>
              <option value="B2C">Divisi B2C</option>
            </select>
          </div>

          {/* FILTER STATUS PEMBAYARAN */}
          <div className="relative flex items-center w-full sm:w-auto flex-1 sm:flex-none">
            <div className="absolute left-3 text-slate-400 pointer-events-none">
              <Banknote className="w-4 h-4" />
            </div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-colors appearance-none"
            >
              <option value="All">{t.allPaymentStatus}</option>
              <option value="Paid">{t.paymentStatus.paid}</option>
              <option value="DP">DP</option>
              <option value="Unpaid">{t.paymentStatus.unpaid}</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          {/* FILTER STATUS EVENT KRONOLOGIS */}
          <div className="relative flex items-center w-full sm:w-auto flex-1 sm:flex-none">
            <div className="absolute left-3 text-slate-400 pointer-events-none">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={eventStatusFilter}
              onChange={(e) => setEventStatusFilter(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-colors appearance-none"
            >
              <option value="All">{t.allEventStatus}</option>
              <option value="upcoming">{t.eventStatus.upcoming}</option>
              <option value="ongoing">{t.eventStatus.ongoing}</option>
              <option value="completed">{t.eventStatus.completed}</option>
              <option value="canceled">{t.eventStatus.canceled}</option>
            </select>
          </div>

          {/* FILTER RENTANG TANGGAL */}
          <div className="relative flex items-center w-full sm:w-auto flex-1 sm:flex-none">
            <div className="flex items-center justify-between sm:justify-start gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all w-full sm:w-auto">
              <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />

              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="bg-transparent text-sm font-medium outline-none w-full sm:w-32 text-slate-700 dark:text-slate-300"
                title="Mulai Tanggal"
              />

              <span className="text-slate-400 text-sm font-medium">-</span>

              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="bg-transparent text-sm font-medium outline-none w-full sm:w-32 text-slate-700 dark:text-slate-300"
                title="Sampai Tanggal"
              />

              {(startDateFilter || endDateFilter) && (
                <button
                  onClick={() => {
                    setStartDateFilter("");
                    setEndDateFilter("");
                  }}
                  className="text-slate-400 hover:text-rose-500 shrink-0 ml-1 transition-colors"
                  title="Hapus rentang tanggal"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABEL */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.colEvent}
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.colSchedule}
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.colPrice}
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  {t.colPaymentStatus}
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  {t.colEventStatus}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedEvents.length > 0 ? (
                paginatedEvents.map((event) => {
                  const chronoStatus = getEventChronologicalStatus(event);
                  const eventStatusConfig = getEventStatusConfig(chronoStatus);
                  const isB2B =
                    (event.client_type || "").toUpperCase() === "B2B";

                  return (
                    <tr
                      key={event.id}
                      onClick={() => router.push(`/owner/events/${event.id}`)}
                      className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                    >
                      {/* Event & Klien + BADGE DIVISI */}
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-primary transition-colors">
                          {event.event_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-slate-400">
                            Klien:{" "}
                            <span className="font-medium text-slate-600 dark:text-slate-300 capitalize">
                              {event.client_name || "-"}
                            </span>
                          </p>
                          {event.client_type && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                isB2B
                                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                                  : "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
                              }`}
                            >
                              {event.client_type}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Jadwal & Lokasi */}
                      <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-300">
                        <p className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />{" "}
                          {formatDate(event.event_date)}{" "}
                          {event.event_time && `• ${event.event_time}`}
                        </p>
                        <p className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1.5 max-w-[200px] truncate leading-relaxed">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />{" "}
                          {event.location || "-"}
                        </p>
                      </td>

                      {/* Harga dan Status Nominal Pembayaran */}
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm font-mono">
                          {formatRupiah(event.total_price)}
                        </p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-1 flex items-center gap-1">
                          <span className="text-slate-400 font-medium">
                            {t.paidLabel}:
                          </span>
                          <span className="font-mono font-bold">
                            {formatRupiah(event.paid_amount || 0)}
                          </span>
                        </p>
                      </td>

                      {/* BADGE STATUS PEMBAYARAN */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${getPaymentStyle(event.payment_status_en || "")}`}
                        >
                          {(event.payment_status_en || "").toLowerCase() ===
                            "paid" && <CheckCircle2 className="w-3 h-3" />}
                          {(event.payment_status_en || "").toLowerCase() ===
                            "overdue" && <AlertCircle className="w-3 h-3" />}
                          {lang === "id"
                            ? event.payment_status
                            : event.payment_status_en}
                        </span>
                      </td>

                      {/* BADGE STATUS EVENT (KRONOLOGIS) */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${eventStatusConfig.className}`}
                        >
                          {eventStatusConfig.icon}
                          {eventStatusConfig.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-16 text-center text-slate-500 italic"
                  >
                    <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    {t.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- KONTROL PAGINATION --- */}
        {totalItems > 0 && (
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
              {t.showing} {startIndex + 1} {t.to}{" "}
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
                {currentPage} / {totalPages || 1}
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
        )}
      </div>
    </div>
  );
}

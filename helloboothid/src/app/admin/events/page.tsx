// src/app/admin/events/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  Filter,
  ArrowUpDown,
  HelpCircle,
  XCircle,
  AlertCircle,
  CalendarClock,
} from "lucide-react";
import { useLanguage } from "@/providers/AppProvider";
import { eventService } from "@/app/services/eventService";

// HELPER: Menghitung status fisik kronologis acara secara Real-Time (Untuk Event Manager)
function getEventChronologicalStatus(event: any) {
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
    const parts = event.event_time.split("-").map((p: string) => p.trim());

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

export default function EventsPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  // --- STATE RENTANG TANGGAL ---
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [eventsData, setEventsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE USER AUTH ---
  const [user, setUser] = useState({ subRole: "", username: "" });

  // --- STATE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json.status === "success") {
            setUser({
              subRole: json.data?.sub_role || json.data?.role || "",
              username: json.data?.username || "",
            });
          }
        }
      } catch (error) {
        console.error("Gagal mengambil data user:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventService.getEvents();
        if (response.status === "success" && Array.isArray(response.data)) {
          setEventsData(response.data);
        } else if (response.data?.events) {
          setEventsData(response.data.events);
        } else {
          setEventsData([]);
        }
      } catch (error) {
        console.error("Gagal mengambil data event:", error);
        setEventsData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Reset ke halaman 1 jika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, startDateFilter, endDateFilter, itemsPerPage]);

  const t = {
    id: {
      title: "Jadwal & Event",
      subtitle: "Kelola semua jadwal operasional, tugas kru, dan detail event.",
      searchPlaceholder: "Cari nama event atau klien...",
      addBtn: "Buat Event Baru",
      colInvoice: "Nama Event",
      colSchedule: "Jadwal & Waktu",
      colLocation: "Lokasi",
      colEventStatus: "Status Event",
      colExecutionStatus: "Status Pelaksanaan",
      colAction: "Aksi",
      viewDetail: "Detail",
      allStatus: "Semua Status",
      noData: "Tidak ada event yang sesuai dengan filter pencarian tersebut.",
      loading: "Memuat jadwal event...",
      statusInquiry: "Inquiry",
      statusConfirmed: "Terkonfirmasi",
      statusDone: "Selesai",
      statusCancelled: "Batal",
      execUpcoming: "Akan Datang",
      execOngoing: "Berlangsung",
      execCompleted: "Selesai",
      execCanceled: "Dibatalkan",
      rowsPerPage: "Data per halaman",
      showing: "Menampilkan",
      to: "hingga",
      of: "dari",
      entries: "entri",
      prev: "Sebelumnya",
      next: "Berikutnya",
    },
    en: {
      title: "Schedules & Events",
      subtitle:
        "Manage all operational schedules, crew tasks, and event details.",
      searchPlaceholder: "Search event or client name...",
      addBtn: "Create New Event",
      colInvoice: "Event Name",
      colSchedule: "Schedule & Time",
      colLocation: "Location",
      colEventStatus: "Event Status",
      colExecutionStatus: "Execution Status",
      colAction: "Action",
      viewDetail: "Detail",
      allStatus: "All Statuses",
      noData: "No events found matching the search filters.",
      loading: "Loading event schedules...",
      statusInquiry: "Inquiry",
      statusConfirmed: "Confirmed",
      statusDone: "Done",
      statusCancelled: "Cancelled",
      execUpcoming: "Upcoming",
      execOngoing: "Ongoing",
      execCompleted: "Completed",
      execCanceled: "Canceled",
      rowsPerPage: "Rows per page",
      showing: "Showing",
      to: "to",
      of: "of",
      entries: "entries",
      prev: "Previous",
      next: "Next",
    },
  }[lang === "id" ? "id" : "en"];

  const formatDateDisplay = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString(
      lang === "id" ? "id-ID" : "en-US",
      options,
    );
  };

  // --- LOGIKA ROLE ---
  const isEventManager = String(user.subRole).toLowerCase().includes("manager");

  const filteredEvents = eventsData.filter((evt: any) => {
    const matchesSearch =
      evt.event_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.client_name?.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter Status Dinamis berdasarkan Role
    let matchesStatus = true;
    if (statusFilter !== "all") {
      if (isEventManager) {
        const chronoStatus = getEventChronologicalStatus(evt);
        matchesStatus = chronoStatus === statusFilter;
      } else {
        const effectiveStatus = (evt.status || "inquiry").toLowerCase();
        matchesStatus = effectiveStatus === statusFilter;
      }
    }

    // --- LOGIKA FILTER RENTANG TANGGAL (STRING COMPARISON) ---
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

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getEventTimestamp = (evt: any) => {
    const dateValue = evt.event_date ? new Date(evt.event_date) : new Date(0);
    const timeValue = String(evt.event_time || "")
      .split("-")[0]
      ?.trim();
    if (timeValue && timeValue.includes(":")) {
      const [hours, minutes] = timeValue
        .split(":")
        .map((value: string) => Number(value) || 0);
      dateValue.setHours(hours, minutes, 0, 0);
    }
    return dateValue.getTime();
  };

  const sortedEvents = [...filteredEvents].sort((a: any, b: any) => {
    const aTime = getEventTimestamp(a);
    const bTime = getEventTimestamp(b);
    return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
  });

  // --- KALKULASI PAGINATION ---
  const totalItems = sortedEvents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = sortedEvents.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {t.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.subtitle}
          </p>
        </div>
        {/* TOMBOL HANYA MUNCUL JIKA BUKAN EVENT MANAGER */}
        {!isEventManager && (
          <button
            onClick={() => router.push("/admin/events/create")}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors font-medium shadow-sm shadow-primary/20 w-full sm:w-auto justify-center active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            <span>{t.addBtn}</span>
          </button>
        )}
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm transition-colors">
        <div className="relative w-full xl:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-colors"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-3 w-full xl:w-auto">
          {/* FILTER STATUS DINAMIS */}
          <div className="relative flex items-center w-full sm:w-auto">
            <div className="absolute left-3 text-slate-400 pointer-events-none">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer shadow-sm transition-colors appearance-none"
            >
              <option value="all">
                {isEventManager ? t.allStatus : t.allStatus}
              </option>
              {isEventManager ? (
                <>
                  <option value="upcoming">{t.execUpcoming}</option>
                  <option value="ongoing">{t.execOngoing}</option>
                  <option value="completed">{t.execCompleted}</option>
                  <option value="canceled">{t.execCanceled}</option>
                </>
              ) : (
                <>
                  <option value="inquiry">{t.statusInquiry}</option>
                  <option value="confirmed">{t.statusConfirmed}</option>
                  <option value="done">{t.statusDone}</option>
                  <option value="cancelled">{t.statusCancelled}</option>
                </>
              )}
            </select>
          </div>

          {/* FILTER RENTANG TANGGAL */}
          <div className="relative flex items-center w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all w-full lg:w-auto">
              <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />

              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="bg-transparent text-sm font-medium outline-none w-full lg:w-28 xl:w-32 text-slate-700 dark:text-slate-300"
                title="Mulai Tanggal"
              />

              <span className="text-slate-400 text-sm font-medium">-</span>

              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="bg-transparent text-sm font-medium outline-none w-full lg:w-28 xl:w-32 text-slate-700 dark:text-slate-300"
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

      {/* TABLE LIST EVENT */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.colInvoice}
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 tracking-wider">
                  <button
                    type="button"
                    onClick={() =>
                      setSortDirection((current) =>
                        current === "asc" ? "desc" : "asc",
                      )
                    }
                    className="inline-flex items-center gap-1.5 group uppercase"
                  >
                    {t.colSchedule}
                    <ArrowUpDown
                      className={`w-3.5 h-3.5 transition-colors ${sortDirection === "desc" ? "text-primary" : "text-slate-400 group-hover:text-slate-600"}`}
                    />
                  </button>
                </th>

                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.colLocation}
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {isEventManager ? t.colExecutionStatus : t.colEventStatus}
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                  {t.colAction}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500">
                    {t.loading}
                  </td>
                </tr>
              ) : paginatedEvents.length > 0 ? (
                paginatedEvents.map((evt: any) => {
                  // Jika Sales, gunakan status asli (inquiry, confirmed dll)
                  // Jika Event Manager, hitung status kronologis
                  const salesStatus = (evt.status || "inquiry").toLowerCase();
                  const managerStatus = getEventChronologicalStatus(evt);

                  const getSalesStatusStyle = (s: string) => {
                    switch (s) {
                      case "inquiry":
                        return "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-700";
                      case "confirmed":
                        return "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-500/20";
                      case "done":
                        return "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-500/20";
                      case "cancelled":
                        return "bg-red-100 text-red-600 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-700";
                      default:
                        return "bg-slate-100 text-slate-600 border-slate-200";
                    }
                  };

                  const getSalesStatusText = (s: string) => {
                    switch (s) {
                      case "inquiry":
                        return t.statusInquiry;
                      case "confirmed":
                        return t.statusConfirmed;
                      case "done":
                        return t.statusDone;
                      case "cancelled":
                        return t.statusCancelled;
                      default:
                        return s;
                    }
                  };

                  const getManagerStatusConfig = (s: string) => {
                    switch (s) {
                      case "upcoming":
                        return {
                          label: t.execUpcoming,
                          className:
                            "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
                          icon: <CalendarClock className="w-3 h-3" />,
                        };
                      case "ongoing":
                        return {
                          label: t.execOngoing,
                          className:
                            "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
                          icon: <AlertCircle className="w-3 h-3" />,
                        };
                      case "completed":
                        return {
                          label: t.execCompleted,
                          className:
                            "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
                          icon: <CheckCircle2 className="w-3 h-3" />,
                        };
                      case "canceled":
                        return {
                          label: t.execCanceled,
                          className:
                            "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
                          icon: <XCircle className="w-3 h-3" />,
                        };
                      default:
                        return {
                          label: s,
                          className: "bg-slate-100 text-slate-600",
                          icon: null,
                        };
                    }
                  };

                  const managerConfig = getManagerStatusConfig(managerStatus);

                  return (
                    <tr
                      key={evt.id}
                      onClick={() => router.push(`/admin/events/${evt.id}`)}
                      className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors cursor-pointer select-none group"
                    >
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                          {evt.event_name}
                        </p>
                        <p className="text-[11px] text-primary mt-0.5 font-medium">
                          {evt.client_name}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />{" "}
                          {formatDateDisplay(evt.event_date)}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />{" "}
                          {evt.event_time}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400 font-medium max-w-[200px] leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />{" "}
                        {evt.location}
                      </td>

                      <td className="py-4 px-6">
                        {isEventManager ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${managerConfig.className}`}
                          >
                            {managerConfig.icon}
                            {managerConfig.label}
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${getSalesStatusStyle(salesStatus)}`}
                          >
                            {salesStatus === "done" && (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            {salesStatus === "cancelled" && (
                              <XCircle className="w-3 h-3" />
                            )}
                            {salesStatus === "inquiry" && (
                              <HelpCircle className="w-3 h-3" />
                            )}
                            {getSalesStatusText(salesStatus)}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1 text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
                          <span>{t.viewDetail}</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
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
        {!loading && totalItems > 0 && (
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

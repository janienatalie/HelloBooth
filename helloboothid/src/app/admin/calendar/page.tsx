"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Wallet,
} from "lucide-react";
import { useLanguage } from "@/providers/AppProvider";

export default function CalendarPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const [currentDate, setCurrentDate] = useState(new Date());
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        setIsLoading(true);

        // TRIK CERDAS: Tarik data Event + data Invoice secara bersamaan!
        const [eventsRes, invoicesRes] = await Promise.all([
          fetch("/api/events"),
          fetch("/api/invoices"),
        ]);

        const eventsJson = await eventsRes.json();
        const invoicesJson = await invoicesRes.json();

        // 1. Buat kamus status keuangan presisi berdasarkan ID Event
        const financialMap: Record<string, string> = {};
        if (invoicesJson.status === "success") {
          invoicesJson.data.forEach((inv: any) => {
            financialMap[inv.eventId || inv.id] = inv.status;
          });
        }

        // 2. Format event dan gabungkan status keuangannya
        if (eventsJson.status === "success") {
          const rawList = Array.isArray(eventsJson.data)
            ? eventsJson.data
            : eventsJson.data?.events || [];

          const formattedEvents = rawList
            .filter((evt: any) => {
              // BUANG EVENT BATAL: Jangan sampai kru datang ke acara cancel!
              const s = (evt.status || "").toLowerCase();
              return s !== "cancelled" && s !== "batal";
            })
            .map((evt: any) => {
              const evtId = evt.id || evt.event_id;

              // PERBAIKAN BUG KOSONG: Tangkap format event_date maupun date
              const rawDate = evt.event_date || evt.date;
              const dateObj = new Date(rawDate);

              if (isNaN(dateObj.getTime())) return null;

              const year = dateObj.getFullYear();
              const month = String(dateObj.getMonth() + 1).padStart(2, "0");
              const day = String(dateObj.getDate()).padStart(2, "0");

              return {
                id: evtId,
                // Tangkap format snake_case maupun camelCase
                eventName: evt.event_name || evt.eventName || "Agenda",
                clientName: evt.client_name || evt.clientName || "-",
                time: evt.event_time || evt.time || "-",
                location: evt.location || "-",
                dateString: `${year}-${month}-${day}`,
                // Status ditarik langsung dari tabel Invoices!
                payStatus: financialMap[evtId] || "Belum Dibayar",
              };
            })
            .filter(Boolean);

          setEvents(formattedEvents);
        }
      } catch (error) {
        console.error("Gagal mengambil jadwal kalender:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarData();
  }, []);

  const t = {
    id: {
      title: "Jadwal & Kalender Kerja",
      subtitle: "Visualisasi jadwal booking bulanan kru lapangan Hellobooth.",
      months: [
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
      ],
      days: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
      noEvent: "Tidak ada jadwal event bulan ini.",
      todayBtn: "Hari Ini",
      ketStats: "Keterangan Status Pembayaran",
      thisMonthEvents: "Daftar Event Bulan Ini",
      statusPaid: "Lunas",
      statusDP: "DP (Sebagian)",
      statusUnpaid: "Belum Dibayar",
      statusOverdue: "Overdue",
    },
    en: {
      title: "Schedule & Work Calendar",
      subtitle:
        "Monthly visual tracking for Hellobooth field crew booking schedule.",
      months: [
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
      ],
      days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      noEvent: "No event scheduled for this month.",
      todayBtn: "Today",
      ketStats: "Payment Status Legend",
      thisMonthEvents: "Events This Month",
      statusPaid: "Paid",
      statusDP: "DP (Partial)",
      statusUnpaid: "Unpaid",
      statusOverdue: "Overdue",
    },
  }[lang === "id" ? "id" : "en"];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const emptyDays = Array(firstDayIndex).fill(null);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarGrid = [...emptyDays, ...monthDays];

  const handlePrevMonth = () =>
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () =>
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Warna Titik berdasarkan Status Pembayaran Invoice
  const getDotColor = (status: string) => {
    // Normalisasi teks agar case-insensitive dan tanpa spasi berlebih
    const normalizedStatus = (status || "").toLowerCase().trim();

    switch (normalizedStatus) {
      case "lunas":
      case "paid":
        return "bg-emerald-500";
      case "dp":
      case "sebagian": // Jika ada variasi penamaan DP
      case "partial":
        return "bg-amber-500";
      case "overdue":
      case "terlambat": // Jika ada variasi bahasa Indonesia
        return "bg-rose-500";
      case "belum dibayar":
      case "unpaid":
        return "bg-blue-500";
      default:
        return "bg-blue-500"; // Fallback aman
    }
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center animate-pulse text-slate-500 font-medium">
        Memuat jadwal kalender...
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

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* KOLOM KALENDER */}
        <div className="xl:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {t.months[currentMonth]} {currentYear}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleToday}
                className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mr-2"
              >
                {t.todayBtn}
              </button>
              <button
                onClick={handlePrevMonth}
                className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 text-center py-2.5 bg-slate-50/30 dark:bg-slate-800/10">
            {t.days.map((day, idx) => (
              <span
                key={day}
                className={`text-xs font-bold tracking-wider uppercase ${idx === 0 ? "text-rose-500" : "text-slate-400 dark:text-slate-500"}`}
              >
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 bg-slate-100 dark:bg-slate-800/40 gap-[1px]">
            {calendarGrid.map((day, index) => {
              if (day === null)
                return (
                  <div
                    key={`empty-${index}`}
                    className="bg-white dark:bg-slate-900 min-h-[100px] p-2"
                  />
                );

              const formatDay = day < 10 ? `0${day}` : day;
              const formatMonth =
                currentMonth + 1 < 10
                  ? `0${currentMonth + 1}`
                  : currentMonth + 1;
              const dateString = `${currentYear}-${formatMonth}-${formatDay}`;

              const dayEvents = events.filter(
                (evt) => evt.dateString === dateString,
              );
              const isToday =
                day === todayDate &&
                currentMonth === todayMonth &&
                currentYear === todayYear;

              return (
                <div
                  key={`day-${day}`}
                  className="bg-white dark:bg-slate-900 min-h-[100px] p-2 flex flex-col justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group relative"
                >
                  <div>
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 text-sm font-semibold rounded-full transition-colors ${isToday ? "bg-primary dark:bg-primary text-white dark:text-slate-900 font-bold shadow-sm" : "text-slate-700 dark:text-slate-300"}`}
                    >
                      {day}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 flex-1 flex flex-col justify-end overflow-hidden">
                    {dayEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => router.push(`/admin/events/${evt.id}`)}
                        className="text-[10px] p-1 rounded-md bg-primary-light dark:bg-primary/10 border-l-2 border-primary truncate font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1 hover:brightness-95 transition-all cursor-pointer"
                        title={`${evt.eventName} (${evt.clientName}) - Status: ${evt.payStatus}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${getDotColor(evt.payStatus)}`}
                        />
                        <span className="truncate">{evt.eventName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* KOLOM AGENDA & LEGEND */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-primary" /> {t.ketStats}
            </h4>

            <div className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">{t.statusPaid}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="truncate">{t.statusDP}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span className="truncate">{t.statusUnpaid}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span className="truncate">{t.statusOverdue}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors space-y-4">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t.thisMonthEvents}
            </h4>
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {events
                .filter((evt) => {
                  const [y, m] = evt.dateString.split("-");
                  return (
                    parseInt(m) - 1 === currentMonth &&
                    parseInt(y) === currentYear
                  );
                })
                .map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => router.push(`/admin/events/${evt.id}`)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all group flex flex-col gap-1.5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-primary dark:text-primary-light truncate max-w-[140px]">
                        {evt.clientName}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${getDotColor(evt.payStatus)}`}
                        title={evt.payStatus}
                      />
                    </div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors truncate">
                      {evt.eventName}
                    </h5>
                    <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <p className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />{" "}
                        {evt.dateString} • {evt.time}
                      </p>
                      <p className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />{" "}
                        {evt.location}
                      </p>
                    </div>
                  </div>
                ))}

              {events.filter((evt) => {
                const [y, m] = evt.dateString.split("-");
                return (
                  parseInt(m) - 1 === currentMonth &&
                  parseInt(y) === currentYear
                );
              }).length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">
                  {t.noEvent}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

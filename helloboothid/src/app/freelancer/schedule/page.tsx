// src/app/freelancer/schedule/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/providers/AppProvider";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Clock,
  Briefcase,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";

export default function SchedulePage() {
  const { lang } = useLanguage();
  const router = useRouter();
  const [filter, setFilter] = useState("All");

  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Filter Disamakan dengan Dashboard Admin (Mulai 2024 hingga tahun depan)
  const years = Array.from(
    { length: currentYear - 2023 + 2 },
    (_, i) => 2024 + i,
  );

  // Kamus Terjemahan Lengkap (Bilingual)
  const t = {
    id: {
      title: "Jadwal Tugas Saya",
      subtitle: "Daftar lengkap event dan penugasan Anda dari HelloBooth.",
      tabAll: "Semua Jadwal",
      tabUpcoming: "Mendatang",
      tabOngoing: "Berlangsung",
      tabCompleted: "Selesai",
      noData: "Tidak ada jadwal untuk kategori ini.",
      roleLabel: "Posisi",
      statusUpcoming: "Mendatang",
      statusOngoing: "Berlangsung",
      statusCompleted: "Selesai",
    },
    en: {
      title: "My Task Schedule",
      subtitle: "Complete list of your events and assignments from HelloBooth.",
      tabAll: "All Schedules",
      tabUpcoming: "Upcoming",
      tabOngoing: "Ongoing",
      tabCompleted: "Completed",
      noData: "No schedules found for this category.",
      roleLabel: "Role",
      statusUpcoming: "Upcoming",
      statusOngoing: "Ongoing",
      statusCompleted: "Completed",
    },
  }[lang === "id" ? "id" : "en"];

  useEffect(() => {
    const fetchSchedules = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/freelancers/schedules?year=${selectedYear}`,
        );

        if (!res.ok) {
          console.error("Gagal mengambil jadwal. Status:", res.status);
          setIsLoading(false);
          return;
        }

        const json = await res.json();
        if (json.status === "success") {
          setSchedules(json.data);
        }
      } catch (error) {
        console.error("Error mengambil jadwal:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, [selectedYear]);

  // Penyesuaian Filter Jadwal Tiga Kategori
  const filteredSchedules = schedules.filter((schedule) => {
    const status = schedule.status || "Upcoming";

    if (filter === "All") return true;
    if (filter === "Upcoming" && status === "Upcoming") return true;
    if (filter === "Ongoing" && status === "Ongoing") return true;
    if (filter === "Completed" && status === "Completed") return true;

    return false;
  });

  const formatDate = (dateString: string) => {
    const locale = lang === "id" ? "id-ID" : "en-US";
    return new Date(dateString).toLocaleDateString(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Komponen Label Status (Mendatang, Berlangsung, Selesai)
  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "Completed") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
          <CheckCircle2 className="w-3 h-3" /> {t.statusCompleted}
        </span>
      );
    }

    if (status === "Ongoing") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400 animate-pulse">
          <Clock className="w-3 h-3" /> {t.statusOngoing}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
        <CalendarDays className="w-3 h-3" /> {t.statusUpcoming}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
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
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TAB NAVIGASI 4 PILIHAN */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 overflow-x-auto">
        <button
          onClick={() => setFilter("All")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
            filter === "All"
              ? "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          {t.tabAll}
        </button>
        <button
          onClick={() => setFilter("Upcoming")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
            filter === "Upcoming"
              ? "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          {t.tabUpcoming}
        </button>
        <button
          onClick={() => setFilter("Ongoing")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
            filter === "Ongoing"
              ? "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-purple-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          {t.tabOngoing}
        </button>
        <button
          onClick={() => setFilter("Completed")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
            filter === "Completed"
              ? "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          {t.tabCompleted}
        </button>
      </div>

      {/* LIST KARTU JADWAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredSchedules.length > 0 ? (
          filteredSchedules.map((schedule) => (
            <div
              key={schedule.id}
              onClick={() => router.push(`/freelancer/schedule/${schedule.id}`)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/50 dark:hover:border-primary/50 transition-all group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors leading-tight">
                    {schedule.eventName}
                  </h3>
                </div>
                <StatusBadge status={schedule.status} />
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {formatDate(schedule.date)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {schedule.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 pt-1.5 line-clamp-2">
                    {schedule.location}
                  </p>
                </div>
              </div>

              <div className="mt-5 bg-slate-50 dark:bg-[#0b1120] rounded-xl p-3 flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {t.roleLabel}
                  </p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">
                    {schedule.role}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50">
            <CalendarDays className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {t.noData}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

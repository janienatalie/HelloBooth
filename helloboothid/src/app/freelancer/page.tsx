// src/app/freelancer/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/providers/AppProvider";
import { Calendar, MapPin, Briefcase, CheckCircle2, User } from "lucide-react";

export default function FreelancerDashboard() {
  const { lang } = useLanguage();
  const router = useRouter();

  // State untuk Nama Asli Freelancer
  const [freelancerName, setFreelancerName] = useState("Kru");

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Filter Disamakan dengan Dashboard Admin
  const years = Array.from(
    { length: currentYear - 2023 + 2 },
    (_, i) => 2024 + i,
  );

  const [dashboardData, setDashboardData] = useState({
    metrics: { upcomingJobs: 0, completedJobs: 0 },
    nearestSchedules: [] as any[],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/freelancers/dashboard?year=${selectedYear}`,
        );

        // Mencegah error crash HTML "Unexpected token <"
        if (!res.ok) {
          console.error("Gagal mengambil data dashboard, status:", res.status);
          setIsLoading(false);
          return;
        }

        const json = await res.json();
        if (json.status === "success") {
          setDashboardData(json.data);

          // Set nama asli freelancer jika dikirimkan oleh API backend
          if (json.data.freelancerName) {
            setFreelancerName(json.data.freelancerName);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedYear]);

  const t = {
    id: {
      welcome: "Halo,",
      subtitle: "Berikut adalah ringkasan jadwal tugas dan event Anda.",
      upcomingJobs: "Tugas Mendatang",
      completedJobs: "Tugas Selesai",
      scheduleTitle: "Jadwal Terdekat",
      scheduleSubtitle: "Persiapkan diri Anda untuk event berikut.",
      noSchedule: "Belum ada jadwal tugas dalam waktu dekat.",
      dateLabel: "Tanggal",
      locationLabel: "Lokasi",
      roleLabel: "Posisi",
    },
    en: {
      welcome: "Hello,",
      subtitle: "Here is the summary of your upcoming jobs and events.",
      upcomingJobs: "Upcoming Jobs",
      completedJobs: "Completed Jobs",
      scheduleTitle: "Nearest Schedule",
      scheduleSubtitle: "Prepare yourself for the following events.",
      noSchedule: "No upcoming schedule in the near future.",
      dateLabel: "Date",
      locationLabel: "Location",
      roleLabel: "Role",
    },
  }[lang === "id" ? "id" : "en"];

  const formatDate = (dateString: string) => {
    const locale = lang === "id" ? "id-ID" : "en-US";
    return new Date(dateString).toLocaleDateString(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* HEADER dengan Sapaan Dinamis */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {t.welcome}{" "}
            <span className="text-primary capitalize">{freelancerName}</span> 👋
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

      {/* METRIK KECIL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              {t.upcomingJobs}
            </p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">
              {dashboardData.metrics.upcomingJobs}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              {t.completedJobs}
            </p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">
              {dashboardData.metrics.completedJobs}
            </p>
          </div>
        </div>
      </div>

      {/* JADWAL TERDEKAT */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {t.scheduleTitle}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.scheduleSubtitle}
            </p>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboardData.nearestSchedules.length > 0 ? (
            dashboardData.nearestSchedules.map((schedule) => (
              <div
                key={schedule.id}
                onClick={() =>
                  router.push(`/freelancer/schedule/${schedule.id}`)
                }
                className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-primary/50 transition-all group cursor-pointer hover:shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors leading-tight">
                    {schedule.eventName}
                  </h4>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-50 dark:border-slate-800/50">
                  <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{formatDate(schedule.date)}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{schedule.location}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg inline-flex w-full">
                    <User className="w-4 h-4 text-primary" />
                    <span>
                      {t.roleLabel}:{" "}
                      <span className="font-bold">{schedule.role}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-10 text-center text-slate-400 text-sm italic">
              {t.noSchedule}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

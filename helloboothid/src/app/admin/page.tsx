// src/app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Calendar,
  Award,
  Clock,
  MapPin,
  ChevronRight,
  CheckCircle2,
  PieChart,
  HelpCircle,
  XCircle,
  Activity,
  Users,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "@/providers/AppProvider";

export default function DashboardPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const years = Array.from(
    { length: currentYear - 2023 + 2 },
    (_, i) => 2024 + i,
  );

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/dashboard?year=${selectedYear}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (json.status === "success") {
          setDashboardData(json.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [selectedYear]);

  const currentMonthName = new Date().toLocaleDateString(
    lang === "id" ? "id-ID" : "en-US",
    { month: "long" },
  );

  const t = {
    id: {
      welcome: "Selamat Datang Kembali,",
      subtitle:
        "Pusat kendali operasional, jadwal booking, dan analitik Hellobooth.",
      recentEventsTitle: "Agenda Event Mendatang",
      recentEventsSubtitle: "Daftar booking dalam 7 hari ke depan.",
      colInvoice: "Nama Event / Klien",
      colSchedule: "Jadwal & Waktu",
      colStatus: "Status",
      colAction: "Aksi",
      viewDetail: "Detail",
      analyticsTitle: `Analitik & Performa Bisnis`,
      chartTitle: "Grafik Tren Pendapatan Bulanan",
      chartSubtitle: `Akumulasi nilai pesanan (Omzet) per bulan.`,
      eventChartTitle: "Grafik Tren Event Bulanan",
      eventChartSubtitle: `Akumulasi jumlah pesanan event yang dieksekusi.`,
      popularPackageTitle: "Proporsi Pesanan Paket",
      colMonth: "Bulan",
      colRevenue: "Omzet",
      colJobs: "Jumlah Job",
      totalOrders: "Total Pesanan",
      loading: "Memuat Dashboard...",
      jobUnit: "Event",
      noEvent: "Tidak ada agenda event dalam 7 hari ke depan.",
      noDataMonth: "Belum ada data bulanan.",
      noDataPackage: "Belum ada pemesanan paket.",
      otherServices: "Layanan Lainnya",
      statusInquiry: "Inquiry",
      statusConfirmed: "Terkonfirmasi",
      statusDone: "Selesai",
      statusCancelled: "Dibatalkan",
      statusUpcoming: "Akan Datang",
      statusOngoing: "Berjalan",
      statusCompleted: "Selesai",
      totalRevenueCard: "Total Omzet",
      totalClientsCard: "Jumlah Klien",
      totalEventClosingCard: "Total Event Closing",
      upcoming30DaysCard: "Event 30 Hari Ke Depan",
      completedEventsCard: "Event Selesai",
      activeFreelancersCard: "Freelancer Aktif",
      topCrewTitle: "Top 5 Kru Teraktif",
      topCrewSubtitle: "Freelancer dengan jam terbang tertinggi di bulan ini.",
      trendJobLabel: "Trend Event",
      clientUnit: "Klien",
      personUnit: "Orang",
    },
    en: {
      welcome: "Welcome Back,",
      subtitle:
        "Hellobooth operational control center, booking schedule, and analytics.",
      recentEventsTitle: "Upcoming Events Agenda",
      recentEventsSubtitle: "Booking list within the next 7 days.",
      colInvoice: "Event Name / Client",
      colSchedule: "Schedule & Time",
      colStatus: "Status",
      colAction: "Action",
      viewDetail: "Detail",
      analyticsTitle: `Business Analytics & Performance`,
      chartTitle: "Monthly Revenue Trend Chart",
      chartSubtitle: `Accumulated order value (Gross Revenue) per month.`,
      eventChartTitle: "Monthly Event Trend Chart",
      eventChartSubtitle: `Accumulated total executed events.`,
      popularPackageTitle: "Package Order Proportion",
      colMonth: "Month",
      colRevenue: "Revenue",
      colJobs: "Total Jobs",
      totalOrders: "Total Orders",
      loading: "Loading Dashboard...",
      jobUnit: "Events",
      noEvent: "No upcoming events in the next 7 days.",
      noDataMonth: "No monthly data available.",
      noDataPackage: "No package orders available.",
      otherServices: "Other Services",
      statusInquiry: "Inquiry",
      statusConfirmed: "Confirmed",
      statusDone: "Done",
      statusCancelled: "Cancelled",
      statusUpcoming: "Upcoming",
      statusOngoing: "Ongoing",
      statusCompleted: "Completed",
      totalRevenueCard: "Total Revenue",
      totalClientsCard: "Total Clients",
      totalEventClosingCard: "Total Closed Events",
      upcoming30DaysCard: "Events Next 30 Days",
      completedEventsCard: "Completed Events",
      activeFreelancersCard: "Active Freelancers",
      topCrewTitle: "Top 5 Active Crew",
      topCrewSubtitle: "Freelancers with the highest flight hours this month.",
      trendJobLabel: "Event Trend",
      clientUnit: "Clients",
      personUnit: "People",
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
    const locale = lang === "id" ? "id-ID" : "en-US";
    return d.toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatMonth = (monthStr: string) => {
    if (lang === "id") return monthStr;
    const monthMap: Record<string, string> = {
      Jan: "Jan",
      Feb: "Feb",
      Maret: "Mar",
      April: "Apr",
      Mei: "May",
      Juni: "Jun",
      Juli: "Jul",
      Agt: "Aug",
      Sep: "Sep",
      Okt: "Oct",
      Nov: "Nov",
      Des: "Dec",
    };
    return monthMap[monthStr] || monthStr;
  };

  const getStatusStyle = (s: string) => {
    switch (s.toLowerCase()) {
      case "inquiry":
        return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
      case "confirmed":
        return "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-500/20";
      case "upcoming":
        return "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-500/20";
      case "ongoing":
        return "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-500/20";
      case "done":
      case "completed":
        return "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-500/20";
      case "cancelled":
      case "canceled":
      case "batal":
        return "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">{t.loading}</p>
      </div>
    );
  }

  const { metrics, recentEvents, monthlyData, packages, topCrew, subRole } =
    dashboardData;

  const safeRoleText = String(subRole).toLowerCase();
  const isEventManager = safeRoleText.includes("manager");

  let displayRole = subRole || "Admin";
  if (safeRoleText.includes("b2b")) displayRole = "Sales B2B";
  if (safeRoleText.includes("b2c")) displayRole = "Sales B2C";
  if (safeRoleText.includes("manager")) displayRole = "Event Manager";

  const visibleEvents = recentEvents.slice(0, 5);

  const safeMonthlyData =
    monthlyData && monthlyData.length > 0 ? monthlyData : [];

  const maxRevenue = Math.max(
    ...safeMonthlyData.map((d: any) => Number(d.revenue) || 0),
  );
  const safeMaxRevenue = maxRevenue > 0 ? maxRevenue : 1;
  const monthlyChartData = safeMonthlyData.map((d: any) => {
    const calculatedHeight = Math.max(
      (Number(d.revenue || 0) / safeMaxRevenue) * 100,
      5,
    );
    return { ...d, height: `${calculatedHeight}%` };
  });

  const safeLen = safeMonthlyData.length > 1 ? safeMonthlyData.length - 1 : 1;
  const maxJobsCount = Math.max(
    ...safeMonthlyData.map((d: any) => Number(d.jobs || 0)),
    1,
  );
  const svgW = 500;
  const svgH = 140;
  const pX = 30;
  const pH = svgH - 40;

  const polylinePoints = safeMonthlyData
    .map((d: any, idx: number) => {
      const x = (idx / safeLen) * (svgW - pX * 2) + pX;
      const val = Number(d.jobs || 0);
      const y = svgH - 20 - (val / maxJobsCount) * pH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const colorPalette = [
    { color: "stroke-primary", bg: "bg-primary" },
    { color: "stroke-emerald-500", bg: "bg-emerald-500" },
    { color: "stroke-blue-500", bg: "bg-blue-500" },
    { color: "stroke-amber-500", bg: "bg-amber-500" },
    { color: "stroke-rose-500", bg: "bg-rose-500" },
    { color: "stroke-indigo-500", bg: "bg-indigo-500" },
    { color: "stroke-violet-500", bg: "bg-violet-500" },
  ];

  const packageDataWithColors = packages.map((pkg: any, index: number) => ({
    ...pkg,
    ...colorPalette[index % colorPalette.length],
  }));

  const totalPackageOrders = packageDataWithColors.reduce(
    (sum: number, pkg: any) => sum + pkg.count,
    0,
  );

  let currentOffset = 0;
  const chartSlices = packageDataWithColors.map((pkg: any) => {
    const percentage =
      totalPackageOrders === 0 ? 0 : pkg.count / totalPackageOrders;
    const circumference = 2 * Math.PI * 15.915;
    const dasharray = `${percentage * circumference} ${circumference}`;
    const offset = currentOffset;
    currentOffset += percentage * circumference;
    return { ...pkg, dasharray, offset };
  });

  const currentSysYear = new Date().getFullYear();
  const currentSysMonth = new Date().getMonth();

  let legendStartIdx = 0;
  if (selectedYear === currentSysYear) {
    legendStartIdx = currentSysMonth > 9 ? 9 : currentSysMonth;
  } else if (selectedYear < currentSysYear) {
    legendStartIdx = 9;
  } else {
    legendStartIdx = 0;
  }
  const dynamicLegendData = safeMonthlyData.slice(
    legendStartIdx,
    legendStartIdx + 3,
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {t.welcome} <span className="text-primary">{displayRole}</span> ✨
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.subtitle}
          </p>
        </div>

        {!isEventManager && (
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl shadow-sm hover:border-primary/50 transition-colors w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer w-full"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!isEventManager && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors flex items-center justify-between gap-2 hover:border-green-500/30">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t.totalRevenueCard} ({selectedYear})
              </p>
              <p className="text-xl font-black text-green-600 dark:text-green-400">
                {formatRupiah(metrics.totalOmzet)}
              </p>
            </div>
            <div className="w-10 h-10 shrink-0 bg-green-50 dark:bg-green-500/10 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors flex items-center justify-between gap-2 hover:border-blue-500/30">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t.totalClientsCard}
              </p>
              <p className="text-xl font-black text-slate-800 dark:text-white">
                {metrics.totalClients} {t.clientUnit}
              </p>
            </div>
            <div className="w-10 h-10 shrink-0 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors flex items-center justify-between gap-2 hover:border-amber-500/30">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t.totalEventClosingCard} ({selectedYear})
              </p>
              <p className="text-xl font-black text-slate-800 dark:text-white">
                {metrics.activeJobs + metrics.completedJobs} {t.jobUnit}
              </p>
            </div>
            <div className="w-10 h-10 shrink-0 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {isEventManager && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors flex items-center justify-between gap-2 hover:border-amber-500/30">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t.upcoming30DaysCard}
              </p>
              <p className="text-xl font-black text-slate-800 dark:text-white">
                {metrics.upcomingJobs} {t.jobUnit}
              </p>
            </div>
            <div className="w-10 h-10 shrink-0 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors flex items-center justify-between gap-2 hover:border-emerald-500/30">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t.completedEventsCard} ({currentMonthName})
              </p>
              <p className="text-xl font-black text-slate-800 dark:text-white">
                {metrics.completedJobsMonth} {t.jobUnit}
              </p>
            </div>
            <div className="w-10 h-10 shrink-0 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors flex items-center justify-between gap-2 hover:border-purple-500/30">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t.activeFreelancersCard}
              </p>
              <p className="text-xl font-black text-slate-800 dark:text-white">
                {metrics.totalFreelancers} {t.personUnit}
              </p>
            </div>
            <div className="w-10 h-10 shrink-0 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/60">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {t.recentEventsTitle}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.recentEventsSubtitle}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                <th className="py-3.5 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.colInvoice}
                </th>
                <th className="py-3.5 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.colSchedule}
                </th>
                <th className="py-3.5 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.colStatus}
                </th>
                <th className="py-3.5 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                  {t.colAction}
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleEvents.length > 0 ? (
                visibleEvents.map((evt: any) => {
                  const rawStatus = (evt.status || "inquiry").toLowerCase();

                  // Inisialisasi variabel untuk status dinamis
                  let effectiveStatus = rawStatus;
                  let statusText = "";
                  let Icon = HelpCircle;

                  // LOGIKA FRONTEND: Perbedaan tampilan status Sales vs Event Manager
                  if (isEventManager) {
                    if (rawStatus === "done") {
                      effectiveStatus = "completed";
                      statusText = t.statusCompleted;
                      Icon = CheckCircle2;
                    } else if (
                      rawStatus === "cancelled" ||
                      rawStatus === "batal"
                    ) {
                      effectiveStatus = "cancelled";
                      statusText = t.statusCancelled;
                      Icon = XCircle;
                    } else {
                      // KUNCI UTAMA: Logika jam event terhubung dengan waktu saat ini (Real-Time)
                      const now = new Date();
                      const eventDate = new Date(evt.date || evt.event_date);

                      let startH = 0,
                        startM = 0,
                        endH = 23,
                        endM = 59;

                      const timeStr = evt.event_time || "";
                      if (timeStr && timeStr.includes("-")) {
                        const parts = timeStr
                          .split("-")
                          .map((s: string) => s.trim());

                        if (parts[0] && parts[0].includes(":")) {
                          const [h, m] = parts[0].split(":").map(Number);
                          if (!isNaN(h)) startH = h;
                          if (!isNaN(m)) startM = m;
                        }

                        if (parts[1] && parts[1].includes(":")) {
                          const [h, m] = parts[1].split(":").map(Number);
                          if (!isNaN(h)) endH = h;
                          if (!isNaN(m)) endM = m;
                        }
                      }

                      const eventStartTime = new Date(eventDate);
                      eventStartTime.setHours(startH, startM, 0, 0);

                      const eventFinishTime = new Date(eventDate);
                      eventFinishTime.setHours(endH, endM, 59, 999);

                      if (now < eventStartTime) {
                        // Jika jam sekarang BELUM melewati waktu mulai
                        effectiveStatus = "upcoming";
                        statusText = t.statusUpcoming;
                        Icon = Calendar;
                      } else if (
                        now >= eventStartTime &&
                        now <= eventFinishTime
                      ) {
                        // Jika jam sekarang SEDANG di antara waktu mulai dan selesai
                        effectiveStatus = "ongoing";
                        statusText = t.statusOngoing;
                        Icon = Activity;
                      } else {
                        // Jika jam sekarang SUDAH melewati waktu selesai
                        effectiveStatus = "completed";
                        statusText = t.statusCompleted;
                        Icon = CheckCircle2;
                      }
                    }
                  } else {
                    // Logika tampilan untuk Sales / Admin (TETAP SAMA)
                    if (rawStatus === "done") {
                      statusText = t.statusDone;
                      Icon = CheckCircle2;
                    } else if (rawStatus === "confirmed") {
                      statusText = t.statusConfirmed;
                      Icon = CheckCircle2;
                    } else if (
                      rawStatus === "cancelled" ||
                      rawStatus === "batal"
                    ) {
                      statusText = t.statusCancelled;
                      Icon = XCircle;
                    } else {
                      statusText = t.statusInquiry;
                      Icon = HelpCircle;
                    }
                  }

                  return (
                    <tr
                      key={evt.id}
                      onClick={() => router.push(`/admin/events/${evt.id}`)}
                      className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors cursor-pointer select-none"
                    >
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                          {evt.eventName}
                        </p>
                        <p className="text-[11px] text-primary mt-0.5">
                          {evt.clientName}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />{" "}
                          {formatDate(evt.date)}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />{" "}
                          {evt.location || "-"}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${getStatusStyle(effectiveStatus)}`}
                        >
                          <Icon className="w-3 h-3" />
                          {statusText}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1 text-primary font-semibold text-sm">
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
                    colSpan={4}
                    className="py-16 text-center text-slate-500 text-sm italic"
                  >
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    {t.noEvent}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isEventManager && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" /> {t.topCrewTitle}(
                {currentMonthName})
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t.topCrewSubtitle}
              </p>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-4 pb-2 snap-x">
            {topCrew.slice(0, 5).map((crew: any, idx: number) => (
              <div
                key={idx}
                className="flex-none w-[240px] flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 transition-colors hover:border-amber-500/30 hover:shadow-sm snap-start"
              >
                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                  <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center text-sm shrink-0">
                    {crew.initial}
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <p
                      className="text-sm font-bold text-slate-800 dark:text-white truncate"
                      title={crew.name}
                    >
                      {crew.name}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500 truncate mt-0.5">
                      {crew.role}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-3 border-l border-slate-200 dark:border-slate-800/60 ml-2">
                  <p className="text-lg font-black text-slate-800 dark:text-white font-mono leading-none">
                    {crew.jobs}
                  </p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase mt-1 tracking-wider">
                    {t.jobUnit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <hr className="border-slate-100 dark:border-slate-800" />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {t.analyticsTitle} {isEventManager && `(${selectedYear})`}
          </h3>

          {isEventManager && (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl shadow-sm hover:border-primary/50 transition-colors w-full sm:w-auto">
              <Calendar className="w-4 h-4 text-slate-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer w-full"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
              {isEventManager ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-500" />{" "}
                        {t.eventChartTitle}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {t.eventChartSubtitle}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100">
                      {t.trendJobLabel}
                    </span>
                  </div>

                  <div className="px-2">
                    <svg
                      viewBox={`0 0 ${svgW} ${svgH}`}
                      className="w-full h-48 overflow-visible"
                    >
                      <line
                        x1={pX}
                        y1={svgH - 20}
                        x2={svgW - pX}
                        y2={svgH - 20}
                        className="stroke-slate-200 dark:stroke-slate-800"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      <polyline
                        fill="none"
                        className="stroke-blue-500 drop-shadow-[0_3px_5px_rgba(59,130,246,0.3)]"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={polylinePoints}
                      />

                      {safeMonthlyData.map((d: any, idx: number) => {
                        const x = (idx / safeLen) * (svgW - pX * 2) + pX;
                        const val = Number(d.jobs || 0);
                        const y = svgH - 20 - (val / maxJobsCount) * pH;
                        return (
                          <g key={idx} className="group cursor-pointer">
                            <rect
                              x={x - 16}
                              y={y - 24}
                              width={32}
                              height={16}
                              rx={4}
                              className="fill-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
                            />
                            <text
                              x={x}
                              y={y - 13}
                              textAnchor="middle"
                              className="text-[10px] font-black fill-slate-600 group-hover:fill-white font-mono pointer-events-none"
                            >
                              {val}
                            </text>
                            <circle
                              cx={x}
                              cy={y}
                              r={4}
                              className="fill-white stroke-blue-500 stroke-[2px] transition-all duration-150 group-hover:stroke-[3px] group-hover:fill-blue-500"
                            />
                            <text
                              x={x}
                              y={svgH}
                              textAnchor="middle"
                              className="text-[9px] font-semibold fill-slate-400 group-hover:fill-blue-500"
                            >
                              {formatMonth(d.month)}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-6 mt-4 border-t border-slate-100 dark:border-slate-800/60">
                    {dynamicLegendData.map((data: any) => (
                      <div
                        key={data.month}
                        className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 text-center hover:border-blue-500/30 transition-colors"
                      >
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {formatMonth(data.month)}
                        </p>
                        <p className="text-xl font-black text-blue-600 dark:text-blue-500 mt-1">
                          {data.jobs}
                        </p>
                        <p className="text-[9px] font-bold text-slate-500 mt-0.5">
                          {t.jobUnit}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />{" "}
                        {t.chartTitle}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {t.chartSubtitle}
                      </p>
                    </div>
                  </div>

                  {monthlyChartData.length > 0 ? (
                    <>
                      <div className="h-48 flex items-end justify-between pt-8 border-b border-slate-100 dark:border-slate-800/60 gap-1 pb-1">
                        {monthlyChartData.map((data: any) => (
                          <div
                            key={data.month}
                            className="flex-1 flex flex-col items-center group h-full relative"
                          >
                            <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-bold px-2 py-1 rounded-lg shadow-md transition-opacity z-10 font-mono whitespace-nowrap pointer-events-none">
                              {formatRupiah(data.revenue)}
                            </div>
                            <div className="flex-1 flex items-end w-full justify-center">
                              <div
                                style={{ height: data.height }}
                                className="w-5 sm:w-8 bg-green-500/20 dark:bg-green-500/15 group-hover:bg-green-500 rounded-t-md transition-all duration-500 min-h-[4px]"
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-green-500 transition-colors mt-2">
                              {formatMonth(data.month)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-6 mt-4 border-t border-slate-100 dark:border-slate-800/60">
                        {dynamicLegendData.map((data: any) => (
                          <div
                            key={data.month}
                            className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 text-center hover:border-green-500/30 transition-colors flex flex-col justify-center"
                          >
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {formatMonth(data.month)}
                            </p>
                            <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">
                              {formatRupiah(data.revenue)}
                            </p>
                            <p className="text-[9px] font-bold text-green-600 dark:text-green-500 mt-1">
                              {data.jobs} {t.jobUnit}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-48 flex items-center justify-center border-b border-slate-100">
                      <p className="text-slate-400 text-sm">{t.noDataMonth}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors space-y-6 h-full min-h-[400px]">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-500" />{" "}
                {t.popularPackageTitle}
              </h4>

              {packageDataWithColors.length > 0 ? (
                <>
                  <div className="flex justify-center items-center relative h-48 my-4">
                    <svg
                      viewBox="0 0 36 36"
                      className="w-40 h-40 transform -rotate-90"
                    >
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        className="stroke-slate-100 dark:stroke-slate-800"
                        strokeWidth="4"
                      />
                      {chartSlices.map((slice: any, idx: number) => (
                        <circle
                          key={idx}
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="none"
                          className={`${slice.color} transition-all duration-1000 ease-out`}
                          strokeWidth="4"
                          strokeDasharray={slice.dasharray}
                          strokeDashoffset={-slice.offset}
                          strokeLinecap="round"
                        />
                      ))}
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">
                        {totalPackageOrders}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {t.totalOrders}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-y-3.5 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    {packageDataWithColors.map((pkg: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 overflow-hidden p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span
                            className={`w-3 h-3 rounded-full shrink-0 ${pkg.bg} shadow-sm`}
                          />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                            {pkg.name || t.otherServices}
                          </span>
                        </div>
                        <span className="text-xs font-black text-slate-800 dark:text-white font-mono shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                          {pkg.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-40 flex items-center justify-center">
                  <p className="text-slate-400 text-sm">{t.noDataPackage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

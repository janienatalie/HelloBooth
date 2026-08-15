// src/app/owner/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Calendar,
  CheckCircle2,
  Users,
  Clock,
  MapPin,
  ChevronRight,
  PieChart,
  Activity,
  HelpCircle,
  XCircle,
  Trophy,
  Filter,
  Banknote,
} from "lucide-react";
import { useLanguage } from "@/providers/AppProvider";

export default function OwnerDashboardPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // --- FILTERS ---
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedChannel, setSelectedChannel] = useState<string>("Semua");

  const years = Array.from(
    { length: currentYear - 2023 + 2 },
    (_, i) => 2024 + i,
  );

  const avatarColors = [
    "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
    "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
  ];

  const getInitials = (name: string) => {
    if (!name) return "KR";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const resStats = await fetch(
          `/api/owner/stats?year=${selectedYear}&channel=${selectedChannel}`,
          {
            cache: "no-store",
          },
        );
        const jsonStats = await resStats.json();

        if (jsonStats.status === "success") {
          setDashboardData(jsonStats.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data dashboard owner:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [selectedYear, selectedChannel]);

  const t = {
    id: {
      welcome: "Selamat Datang Kembali,",
      subtitle:
        "Pusat pantauan analitik performa dan finansial Hellobooth Anda.",
      cardTotalRevenue: "Total Omzet Keseluruhan",
      cardRevenueB2B: "Omzet Divisi B2B",
      cardRevenueB2C: "Omzet Divisi B2C",
      cardCashSub: "Kas Riil Masuk",
      fromGross: "Dari omzet tercetak:",
      cardEvents: "Total Event Berjalan",
      cardCompleted: "Event Selesai",
      cardCrew: "Total Freelancer Aktif",
      recentEventsTitle: "Agenda Event Mendatang",
      recentEventsSubtitle: "Daftar booking dalam 7 hari ke depan.",
      topCrewTitle: "Top 5 Kru Berkinerja Terbaik",
      topCrewSubtitle: "Berdasarkan penugasan event.",
      rank: "Peringkat",
      noCrewData: "Belum ada data kru yang ditugaskan.",
      colInvoice: "No. Event / Klien",
      colSchedule: "Jadwal",
      colStatus: "Status",
      colAction: "Aksi",
      viewDetail: "Detail",
      analyticsTitle: "Analitik & Performa Bisnis",
      allDivisions: "Semua Divisi",
      divB2B: "Divisi B2B",
      divB2C: "Divisi B2C",
      chartTitle: "Grafik Tren Pendapatan Bulanan",
      chartSubtitle: "Akumulasi nilai pesanan (Omzet) per bulan.",
      lineChartTitle: "Grafik Tren Jumlah Event Bulanan",
      lineChartSubtitle: "Akumulasi pesanan event yang tereksekusi.",
      popularPackageTitle: "Proporsi Pesanan Paket",
      recentMonthsTable: "Rincian Performa Triwulan",
      colMonth: "Bulan",
      colRevenue: "Omzet",
      colJobs: "Jumlah Event",
      totalOrders: "Total Pesanan",
      loading: "Memuat Dashboard Owner...",
      noEvent: "Tidak ada agenda event dalam 7 hari ke depan.",
      noDataMonth: "Belum ada data bulanan.",
      noDataPackage: "Belum ada pemesanan paket.",
      noMonthDataText: "Data bulan tidak tersedia.",
      otherServices: "Layanan Lainnya",
      jobUnit: "Event",
      statusInquiry: "Inquiry",
      statusConfirmed: "Terkonfirmasi",
      statusDone: "Selesai",
      statusCancelled: "Dibatalkan",
    },
    en: {
      welcome: "Welcome Back,",
      subtitle:
        "Your Hellobooth financial and performance analytics monitoring center.",
      cardTotalRevenue: "Total Gross Revenue",
      cardRevenueB2B: "B2B Division Revenue",
      cardRevenueB2C: "B2C Division Revenue",
      cardCashSub: "Actual Cash Collected",
      fromGross: "From gross revenue:",
      cardEvents: "Total Active Events",
      cardCompleted: "Completed Events",
      cardCrew: "Total Active Freelancers",
      recentEventsTitle: "Upcoming Events",
      recentEventsSubtitle: "Booking list within the next 7 days.",
      topCrewTitle: "Top 5 Performing Crew",
      topCrewSubtitle: "Based on event assignments.",
      rank: "Rank",
      noCrewData: "No crew assigned yet.",
      colInvoice: "Event No / Client",
      colSchedule: "Schedule",
      colStatus: "Status",
      colAction: "Action",
      viewDetail: "Detail",
      analyticsTitle: "Business Analytics & Performance",
      allDivisions: "All Divisions",
      divB2B: "B2B Division",
      divB2C: "B2C Division",
      chartTitle: "Monthly Revenue Trend",
      chartSubtitle: "Accumulated order value (Gross Revenue) per month.",
      lineChartTitle: "Monthly Event Count Trend",
      lineChartSubtitle: "Accumulated executed event orders.",
      popularPackageTitle: "Package Order Proportion",
      recentMonthsTable: "Quarterly Performance Details",
      colMonth: "Month",
      colRevenue: "Revenue",
      colJobs: "Total Events",
      totalOrders: "Total Orders",
      loading: "Loading Owner Dashboard...",
      noEvent: "No upcoming events in the next 7 days.",
      noDataMonth: "No monthly data available.",
      noDataPackage: "No package orders available.",
      noMonthDataText: "Monthly data not available.",
      otherServices: "Other Services",
      jobUnit: "Events",
      statusInquiry: "Inquiry",
      statusConfirmed: "Confirmed",
      statusDone: "Done",
      statusCancelled: "Cancelled",
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
      case "done":
        return "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-500/20";
      case "cancelled":
        return "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getStatusText = (s: string) => {
    switch (s.toLowerCase()) {
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

  if (isLoading || !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">{t.loading}</p>
      </div>
    );
  }

  const {
    recentEvents,
    monthlyData,
    packages,
    totalRevenue,
    b2bRevenue,
    b2cRevenue,
    cashCollected,
    totalEvents,
    completedEvents,
    totalCrew,
    topCrew,
  } = dashboardData;

  // LOGIKA FRONTEND: Potong agenda event mendatang maksimal 5 data
  const visibleEvents = recentEvents ? recentEvents.slice(0, 5) : [];

  const getDynamicThreeMonths = () => {
    if (!monthlyData || monthlyData.length < 12) return [];
    const currentMonthIdx = new Date().getMonth();
    if (selectedYear < currentYear) return monthlyData.slice(9, 12);
    else if (selectedYear === currentYear)
      return monthlyData.slice(currentMonthIdx, currentMonthIdx + 3);
    else return monthlyData.slice(0, 3);
  };
  const dynamicThreeMonths = getDynamicThreeMonths();

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

  const safeMonthly =
    monthlyData && monthlyData.length > 0
      ? monthlyData
      : [{ month: "Jan", jobs: 0 }];
  const safeLen = safeMonthly.length > 1 ? safeMonthly.length - 1 : 1;
  const maxJobsCount = Math.max(
    ...safeMonthly.map((d: any) => Number(d.jobs || 0)),
    1,
  );
  const svgW = 400;
  const svgH = 90;
  const pX = 20;
  const pH = svgH - 30;

  const polylinePoints = safeMonthly
    .map((d: any, idx: number) => {
      const x = (idx / safeLen) * (svgW - pX * 2) + pX;
      const y = svgH - 15 - (Number(d.jobs || 0) / maxJobsCount) * pH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // PALET WARNA DIPERBARUI SESUAI HALAMAN ADMIN
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* HEADER DASHBOARD */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {t.welcome} <span className="text-primary">Owner</span> ✨
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

      {/* 6 KARTU METRIK UTAMA (Grid 3 Kolom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* ROW 1: METRIK KEUANGAN */}

        {/* Kartu 1: Total Omzet */}
        {/* Kartu: Total Uang Masuk (Dibayar) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[130px] group overflow-hidden relative">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
              {t.cardCashSub}
            </p>
            <div className="w-10 h-10 shrink-0 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-2xl lg:text-2xl font-black text-emerald-600 dark:text-emerald-400 truncate tracking-tight">
              {formatRupiah(dashboardData?.cashCollected || 0)}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              {t.fromGross}{" "}
              <span className="font-bold text-slate-500 dark:text-slate-300">
                {formatRupiah(dashboardData?.totalRevenue || 0)}
              </span>
            </p>
          </div>
        </div>

        {/* Kartu 2: Omzet B2B */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[130px] group overflow-hidden relative">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
              {t.cardRevenueB2B}
            </p>
            <div className="w-10 h-10 shrink-0 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-2xl lg:text-2xl font-black text-blue-600 dark:text-blue-400 truncate tracking-tight">
              {formatRupiah(b2bRevenue)}
            </p>
          </div>
        </div>

        {/* Kartu 3: Omzet B2C */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[130px] group overflow-hidden relative">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
              {t.cardRevenueB2C}
            </p>
            <div className="w-10 h-10 shrink-0 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-2xl lg:text-2xl font-black text-purple-600 dark:text-purple-400 truncate tracking-tight">
              {formatRupiah(b2cRevenue)}
            </p>
          </div>
        </div>

        {/* ROW 2: METRIK OPERASIONAL */}

        {/* Kartu 4: Total Event Mendatang/Berjalan */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[130px] group overflow-hidden relative">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
              {t.cardEvents}
            </p>
            <div className="w-10 h-10 shrink-0 bg-sky-50 dark:bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-2xl lg:text-2xl font-black text-slate-800 dark:text-white truncate">
              {totalEvents}
            </p>
          </div>
        </div>

        {/* Kartu 5: Total Event Selesai */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[130px] group overflow-hidden relative">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
              {t.cardCompleted}
            </p>
            <div className="w-10 h-10 shrink-0 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-2xl lg:text-2xl font-black text-emerald-600 dark:text-emerald-400 truncate">
              {completedEvents}
            </p>
          </div>
        </div>

        {/* Kartu 6: Total Kru Aktif */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[130px] group overflow-hidden relative">
          <div className="flex items-start justify-between gap-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
              {t.cardCrew}
            </p>
            <div className="w-10 h-10 shrink-0 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-2xl lg:text-2xl  font-black text-amber-600 dark:text-amber-400 truncate">
              {totalCrew}
            </p>
          </div>
        </div>
      </div>

      {/* BLOK GRID AGENDA & TOP KRU */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* AGENDA EVENT MENDATANG */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {t.recentEventsTitle}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.recentEventsSubtitle}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[600px]">
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
                    const effectiveStatus = (
                      evt.status || "inquiry"
                    ).toLowerCase();
                    return (
                      <tr
                        key={evt.id}
                        onClick={() => router.push(`/owner/events/${evt.id}`)}
                        className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer group select-none"
                      >
                        <td className="py-4 px-6">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {evt.eventName}
                          </p>
                          <p className="text-[11px] text-primary mt-0.5 flex items-center gap-1">
                            {evt.clientName}
                          </p>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-300">
                          <p className="flex items-center gap-1 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />{" "}
                            {formatDate(evt.date)}
                          </p>
                          <p className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium truncate max-w-[200px]">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />{" "}
                            {evt.location || "-"}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${getStatusStyle(effectiveStatus)}`}
                          >
                            {effectiveStatus === "done" && (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            {effectiveStatus === "cancelled" && (
                              <XCircle className="w-3 h-3" />
                            )}
                            {effectiveStatus === "inquiry" && (
                              <HelpCircle className="w-3 h-3" />
                            )}
                            {getStatusText(effectiveStatus)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button className="text-primary font-bold text-xs inline-flex items-center gap-1">
                            <span>{t.viewDetail}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
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

        {/* TOP 5 KRU */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> {t.topCrewTitle}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.topCrewSubtitle}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {topCrew?.length > 0 ? (
              topCrew.map((crew: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${avatarColors[idx % avatarColors.length]}`}
                    >
                      {getInitials(crew.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">
                        {crew.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {t.rank} #{idx + 1}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md">
                    {crew.job_count} {t.jobUnit}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                {t.noCrewData}
              </p>
            )}
          </div>
        </div>
      </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* BLOK ANALITIK TERPADU */}
      <div className="space-y-4">
        {/* Header Section dengan Filter Channel */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {t.analyticsTitle} ({selectedYear})
          </h3>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl shadow-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="Semua">{t.allDivisions}</option>
              <option value="B2B">{t.divB2B}</option>
              <option value="B2C">{t.divB2C}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* KARTU KIRI: GRAFIK BATANG & GRAFIK GARIS (Di set h-full flex flex-col) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors flex flex-col h-full space-y-6">
            {/* Grafik Batang Pendapatan */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />{" "}
                    {t.chartTitle}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t.chartSubtitle}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 px-2.5 py-1 rounded-lg">
                  IDR
                </span>
              </div>

              {monthlyChartData.length > 0 ? (
                <div className="h-40 flex items-end justify-between pt-8 px-2 gap-2 sm:gap-4">
                  {monthlyChartData.map((data: any) => (
                    <div
                      key={data.month}
                      className="relative flex-1 flex flex-col items-center h-full justify-end group"
                    >
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md transition-opacity text-center font-mono whitespace-nowrap z-10 pointer-events-none">
                        {formatRupiah(data.revenue)}
                      </div>
                      <div
                        style={{ height: data.height }}
                        className="w-full max-w-[28px] bg-emerald-500/20 dark:bg-emerald-500/15 group-hover:bg-emerald-500 rounded-t-md transition-all duration-500 min-h-[4px]"
                      />
                      <span className="text-[10px] font-bold text-slate-400 mt-2 group-hover:text-emerald-500 transition-colors">
                        {formatMonth(data.month)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center">
                  <p className="text-slate-400 text-sm">{t.noDataMonth}</p>
                </div>
              )}
            </div>

            <hr className="border-slate-100 dark:border-slate-800/80" />

            {/* Diagram Garis Jumlah Pekerjaan */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />{" "}
                    {t.lineChartTitle}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t.lineChartSubtitle}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 px-2.5 py-1 rounded-lg">
                  Vol
                </span>
              </div>

              <div className="pt-3 px-2">
                <svg
                  viewBox={`0 0 ${svgW} ${svgH}`}
                  className="w-full h-24 overflow-visible"
                >
                  <line
                    x1={pX}
                    y1={svgH - 15}
                    x2={svgW - pX}
                    y2={svgH - 15}
                    className="stroke-slate-200 dark:stroke-slate-800"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <polyline
                    fill="none"
                    className="stroke-blue-500 dark:stroke-blue-400 drop-shadow-[0_3px_5px_rgba(59,130,246,0.3)]"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={polylinePoints}
                  />

                  {safeMonthly.map((d: any, idx: number) => {
                    const x = (idx / safeLen) * (svgW - pX * 2) + pX;
                    const val = Number(d.jobs || 0);
                    const y = svgH - 15 - (val / maxJobsCount) * pH;

                    return (
                      <g key={idx} className="group cursor-pointer">
                        <rect
                          x={x - 14}
                          y={y - 21}
                          width={28}
                          height={14}
                          rx={4}
                          className="fill-slate-800 dark:fill-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
                        />
                        <text
                          x={x}
                          y={y - 10}
                          textAnchor="middle"
                          className="text-[10px] font-black fill-slate-600 dark:fill-slate-300 group-hover:fill-white dark:group-hover:fill-slate-900 font-mono transition-colors duration-150 select-none pointer-events-none"
                        >
                          {val}
                        </text>
                        <circle
                          cx={x}
                          cy={y}
                          r={4}
                          className="fill-blue-600 dark:fill-blue-400 stroke-white dark:stroke-slate-900 stroke-[2px] transition-all duration-150 group-hover:stroke-[3px] group-hover:fill-primary"
                        />
                        <text
                          x={x}
                          y={svgH}
                          textAnchor="middle"
                          className="text-[9px] font-semibold fill-slate-400 group-hover:fill-blue-500 transition-colors"
                        >
                          {formatMonth(d.month)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Spacer untuk memastikan tabel selalu di bawah jika ruang tersedia */}
            <div className="flex-1" />

            {/* Tabel Rincian 3 Bulan Dinamis */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-auto">
              <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                {t.recentMonthsTable}
              </p>
              <table className="w-full text-left text-xs border-collapse">
                <tbody>
                  {dynamicThreeMonths.map((data: any) => (
                    <tr
                      key={data.month}
                      className="border-b border-slate-50/50 dark:border-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-2.5 px-2 font-bold">
                        {formatMonth(data.month)}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-medium text-blue-600 dark:text-blue-400">
                        {data.jobs} {t.jobUnit}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(data.revenue)}
                      </td>
                    </tr>
                  ))}
                  {dynamicThreeMonths.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-4 text-center text-slate-400"
                      >
                        {t.noMonthDataText}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* KARTU KANAN: GRAFIK DONUT (DISAMAKAN DENGAN HALAMAN ADMIN) */}
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
  );
}

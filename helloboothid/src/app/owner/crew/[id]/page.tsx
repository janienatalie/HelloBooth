// src/app/owner/crew/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useLanguage } from "@/providers/AppProvider";

export default function OwnerCrewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        if (!params?.id) return;
        const res = await fetch(`/api/owner/crew/${params.id}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Gagal mengambil data profil");
        const json = await res.json();
        if (json.status === "success") setData(json.data);
      } catch (error) {
        console.error("Error memuat detail kru:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [params]);

  const t = {
    id: {
      back: "Kembali ke Direktori",
      loading: "Memuat profil freelancer...",
      noData: "Profil freelancer tidak ditemukan.",
      contactInfo: "Informasi Kontak & Peran",
      eventHistory: "Riwayat Penugasan Event",
      colEvent: "Nama Event",
      colDate: "Tanggal Pelaksanaan",
      colRole: "Posisi Tugas",
      colEventStatus: "Status Event", // <-- Kolom Operasional
      colPaymentStatus: "Status Pembayaran", // <-- Kolom Keuangan BARU
      noHistory: "Freelancer ini belum memiliki riwayat penugasan event.",
      lblRole: "Posisi / Peran",
      lblPhone: "Telepon / WA",
      lblEmail: "Alamat Email",
      // Label Status Operasional
      statusUpcoming: "Mendatang",
      statusOngoing: "Berlangsung",
      statusCompleted: "Selesai",
      statusCancelled: "Batal",
      statusActive: "Aktif",
      statusInactive: "Tidak Aktif",
    },
    en: {
      back: "Back to Directory",
      loading: "Loading freelancer profile...",
      noData: "Freelancer profile not found.",
      contactInfo: "Contact & Role Information",
      eventHistory: "Event Assignment History",
      colEvent: "Event Name",
      colDate: "Execution Date",
      colRole: "Assigned Role",
      colEventStatus: "Event Status",
      colPaymentStatus: "Payment Status",
      noHistory: "This freelancer has no event assignment history yet.",
      lblRole: "Position / Role",
      lblPhone: "Phone / WhatsApp",
      lblEmail: "Email Address",
      // Label Status Operasional
      statusUpcoming: "Upcoming",
      statusOngoing: "Ongoing",
      statusCompleted: "Completed",
      statusCancelled: "Cancelled",
      statusActive: "Active",
      statusInactive: "Inactive",
    },
  }[lang === "id" ? "id" : "en"];

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(
      lang === "id" ? "id-ID" : "en-US",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      },
    );
  };

  const isCrewActive =
    data?.status?.toLowerCase() === "active" ||
    data?.status?.toLowerCase() === "aktif";

  // --- 1. FUNGSI PENENTU STATUS OPERASIONAL (UPCOMING, ONGOING, COMPLETED) ---
  const getOperationalStatus = (evtDate: string, dbStatus: string) => {
    if (dbStatus?.toLowerCase() === "batal") {
      return {
        label: t.statusCancelled,
        className:
          "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
      };
    }
    if (
      dbStatus?.toLowerCase() === "selesai" ||
      dbStatus?.toLowerCase() === "completed"
    ) {
      return {
        label: t.statusCompleted,
        className:
          "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      };
    }

    if (!evtDate) {
      return {
        label: t.statusUpcoming,
        className:
          "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
      };
    }

    const eventDateRaw = new Date(evtDate).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);

    if (eventDateRaw > today) {
      return {
        label: t.statusUpcoming,
        className:
          "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
      };
    } else if (eventDateRaw === today) {
      return {
        label: t.statusOngoing,
        className:
          "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20 animate-pulse font-bold",
      };
    } else {
      return {
        label: t.statusCompleted,
        className:
          "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      };
    }
  };

  // --- 2. FUNGSI PENENTU STATUS PEMBAYARAN (LUNAS, DEAL, DP, BATAL) ---
  const getPaymentStatusInfo = (statusRaw: string) => {
    const s = (statusRaw || "Inquiry").trim();
    const lower = s.toLowerCase();

    if (
      lower === "lunas" ||
      lower === "selesai" ||
      lower === "paid" ||
      lower === "paid off"
    ) {
      return {
        label: lang === "id" ? "Lunas" : "Paid",
        className:
          "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      };
    }
    if (lower === "dp" || lower.includes("dp") || lower === "partial") {
      return {
        label: "DP",
        className:
          "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
      };
    }
    if (lower === "overdue") {
      return {
        label: "Overdue",
        className:
          "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
      };
    }
    return {
      label: lang === "id" ? "Belum Dibayar" : "Unpaid",
      className:
        "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700",
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-medium">{t.loading}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-rose-500 font-medium">
        {t.noData}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Tombol Kembali */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> {t.back}
        </button>
      </div>

      {/* HEADER PROFIL KRU */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 dark:bg-primary/20 text-primary font-black text-4xl flex items-center justify-center shrink-0 aspect-square border border-primary/10 shadow-sm select-none">
              {data.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white capitalize tracking-tight">
                {data.name}
              </h2>
            </div>
          </div>

          <span
            className={`px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-wider shrink-0 ${
              isCrewActive
                ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
            }`}
          >
            {isCrewActive ? t.statusActive : t.statusInactive}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-100 dark:border-slate-800/60 mt-8">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-lg text-primary shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                {t.lblRole}
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize mt-0.5">
                {data.role || "Freelancer"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-lg text-primary shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                {t.lblPhone}
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                {data.phone || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 overflow-hidden">
            <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-lg text-primary shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="text-left overflow-hidden">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                {t.lblEmail}
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5 truncate">
                {data.email || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TABEL RIWAYAT PENUGASAN EVENT (5 KOLOM) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
            {t.eventHistory}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.colEvent}
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.colDate}
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.colRole}
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  {t.colEventStatus}
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  {t.colPaymentStatus}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {data.history.length > 0 ? (
                data.history.map((evt: any) => {
                  const opStatus = getOperationalStatus(
                    evt.event_date,
                    evt.event_status,
                  );
                  const payStatus = getPaymentStatusInfo(evt.payment_status);

                  return (
                    <tr
                      key={evt.id}
                      onClick={() => router.push(`/owner/events/${evt.id}`)}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white text-sm capitalize group-hover:text-primary transition-colors">
                        {evt.event_name}
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300 font-medium">
                        {formatDate(evt.event_date)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide">
                          {evt.assigned_role}
                        </span>
                      </td>

                      {/* Kolom 4: Status Pelaksanaan (Upcoming, Ongoing, Completed) */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${opStatus.className}`}
                        >
                          {opStatus.label === t.statusCompleted && (
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                          )}
                          {opStatus.label === t.statusCancelled && (
                            <XCircle className="w-3 h-3 shrink-0" />
                          )}
                          {opStatus.label === t.statusOngoing && (
                            <Clock className="w-3 h-3 shrink-0" />
                          )}
                          {opStatus.label === t.statusUpcoming && (
                            <CalendarDays className="w-3 h-3 shrink-0" />
                          )}
                          {opStatus.label}
                        </span>
                      </td>

                      {/* Kolom 5: Status Pembayaran (Lunas, Deal, DP, Inquiry) */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${payStatus.className}`}
                        >
                          {payStatus.label === "Lunas" ||
                          payStatus.label === "Paid" ? (
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                          ) : payStatus.label === "Batal" ||
                            payStatus.label === "Cancelled" ? (
                            <XCircle className="w-3 h-3 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                          )}
                          {payStatus.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <p className="text-sm text-slate-400 italic">
                      {t.noHistory}
                    </p>
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

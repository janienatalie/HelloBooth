// src/app/freelancer/schedule/[id]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/providers/AppProvider";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  CalendarDays,
  FileText,
  Package,
  PlusCircle,
  Image as ImageIcon,
  Users,
  MessageCircle,
} from "lucide-react";

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { lang } = useLanguage();
  const unwrappedParams = use(params);
  const eventId = unwrappedParams.id;

  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);

  const t = {
    id: {
      back: "Kembali",
      mainInfo: "Informasi Utama",
      serviceInfo: "Layanan & Add-ons",
      notes: "Catatan Tambahan",
      backdrop: "Detail Backdrop",
      startTime: "Waktu Mulai",
      endTime: "Waktu Selesai",
      statusUpcoming: "Mendatang",
      statusOngoing: "Berlangsung",
      statusCompleted: "Selesai",
      noAddons: "Tidak ada add-ons",
      noNotes: "Tidak ada catatan",
      noBackdrop: "Tidak ada informasi backdrop",
      partnerInfo: "Rekan Tim",
      contactPartner: "Chat WhatsApp",
      soloDuty: "Anda bertugas sendiri untuk event ini.",
      valNoBackdrop: "Tanpa Backdrop (Disediakan Vendor Decor)",
      eventNotFound: "Event tidak ditemukan atau bukan tugas Anda.",
      backToSchedule: "Kembali ke Jadwal",
      dateLabel: "Tanggal",
      locationLabel: "Lokasi",
      mainService: "Layanan Utama",
      addonsLabel: "Add-ons",
    },
    en: {
      back: "Back",
      mainInfo: "Main Information",
      serviceInfo: "Services & Add-ons",
      notes: "Additional Notes",
      backdrop: "Backdrop Detail",
      startTime: "Start Time",
      endTime: "End Time",
      statusUpcoming: "Upcoming",
      statusOngoing: "Ongoing",
      statusCompleted: "Completed",
      noAddons: "No add-ons",
      noNotes: "No notes available",
      noBackdrop: "No backdrop information",
      partnerInfo: "Team Member",
      contactPartner: "Chat via WhatsApp",
      soloDuty: "You are assigned solo for this event.",
      valNoBackdrop: "No Backdrop (Provided by Decor Vendor)",
      eventNotFound: "Event not found or not assigned to you.",
      backToSchedule: "Back to Schedule",
      dateLabel: "Date",
      locationLabel: "Location",
      mainService: "Main Service",
      addonsLabel: "Add-ons",
    },
  }[lang === "id" ? "id" : "en"];

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const res = await fetch(`/api/freelancers/schedules/${eventId}`);
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/");
            return;
          }
          return;
        }

        const json = await res.json();
        if (json.status === "success") {
          setEvent(json.data);
        }
      } catch (err) {
        console.error("Terjadi kesalahan:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) fetchEventData();
  }, [eventId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-slate-500 font-bold">{t.eventNotFound}</p>
        <button
          onClick={() => router.back()}
          className="text-primary underline"
        >
          {t.backToSchedule}
        </button>
      </div>
    );
  }

  const teamList = Array.isArray(event?.partners)
    ? event.partners
    : event?.partner
      ? [event.partner]
      : [];

  const currentStatus = event?.status || "Upcoming";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 max-w-5xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        {t.back}
      </button>

      {/* HEADER CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white leading-tight">
          {event?.eventName}
        </h2>

        {/* Dynamic Status Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${
            currentStatus === "Completed"
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400"
              : currentStatus === "Ongoing"
                ? "bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 animate-pulse"
                : "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400"
          }`}
        >
          {currentStatus === "Completed" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : currentStatus === "Ongoing" ? (
            <Clock className="w-4 h-4" />
          ) : (
            <CalendarDays className="w-4 h-4" />
          )}
          {currentStatus === "Completed"
            ? t.statusCompleted
            : currentStatus === "Ongoing"
              ? t.statusOngoing
              : t.statusUpcoming}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. INFO UTAMA (KIRI ATAS) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <Calendar className="w-4 h-4" /> {t.mainInfo}
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">
                  {t.dateLabel}
                </p>
                <p className="text-base font-bold text-slate-800 dark:text-white">
                  {formatDate(event?.date)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-500 uppercase">
                    {t.startTime}
                  </p>
                  <p className="text-base font-bold text-slate-800 dark:text-white">
                    {event?.startTime || "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-500 uppercase">
                    {t.endTime}
                  </p>
                  <p className="text-base font-bold text-slate-800 dark:text-white">
                    {event?.endTime || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-2">
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">
                  {t.locationLabel}
                </p>
                <p className="text-sm font-bold text-slate-800 dark:text-white leading-relaxed">
                  {event?.location || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. LAYANAN & ADDONS (KANAN ATAS) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <Package className="w-4 h-4" /> {t.serviceInfo}
          </h3>
          <div>
            <p className="text-xs font-bold text-primary uppercase mb-3 flex items-center gap-2">
              {t.mainService}
            </p>
            <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-2xl border border-primary/20">
              <p className="text-base font-black text-slate-800 dark:text-white">
                {event?.service}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
              <PlusCircle className="w-3.5 h-3.5" /> {t.addonsLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              {event?.addons?.length > 0 ? (
                event.addons.map((addon: any, idx: number) => (
                  <span
                    key={idx}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700"
                  >
                    {addon.name}{" "}
                    {addon.quantity > 1 ? `(x${addon.quantity})` : ""}
                  </span>
                ))
              ) : (
                <p className="text-xs italic text-slate-400">{t.noAddons}</p>
              )}
            </div>
          </div>
        </div>

        {/* 3. BACKDROP DETAIL (FULL WIDTH RIBBON) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm col-span-1 md:col-span-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> {t.backdrop}
          </h3>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 capitalize">
            {(() => {
              const rawBackdrop = event?.backdrop || "";
              if (!rawBackdrop) return t.noBackdrop;

              if (rawBackdrop.toLowerCase().includes("tanpa backdrop")) {
                return t.valNoBackdrop;
              }
              return rawBackdrop;
            })()}
          </div>
        </div>

        {/* 4. TEAM MEMBER (FULL WIDTH HORIZONTAL CARDS) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm col-span-1 md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <Users className="w-4 h-4" /> {t.partnerInfo}
          </h3>

          {teamList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {teamList.map((member: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 gap-3 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-lg border border-primary/20 shrink-0">
                      {member.name ? member.name.charAt(0).toUpperCase() : "C"}
                    </div>
                    <div className="truncate">
                      <p className="text-base font-bold text-slate-800 dark:text-white truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                        {member.role || "Crew"}
                      </p>
                    </div>
                  </div>

                  {member.phone && (
                    <a
                      href={`https://wa.me/${member.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-500/20 transition-all shrink-0 active:scale-95"
                      title={t.contactPartner}
                    >
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic py-2">{t.soloDuty}</p>
          )}
        </div>

        {/* 5. ADDITIONAL NOTES (FULL WIDTH) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm col-span-1 md:col-span-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" /> {t.notes}
          </h3>
          <div className="bg-amber-50/50 dark:bg-amber-500/5 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-sm leading-relaxed text-slate-600 dark:text-slate-300 italic whitespace-pre-wrap">
            {event?.notes ? `"${event.notes}"` : `"${t.noNotes}"`}
          </div>
        </div>
      </div>
    </div>
  );
}

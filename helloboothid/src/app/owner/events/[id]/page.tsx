// src/app/owner/events/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Camera,
  FileText,
  Clock,
  Receipt,
  Layout,
  StickyNote,
  CalendarClock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Banknote,
} from "lucide-react";
import { useLanguage } from "@/providers/AppProvider";

export default function OwnerEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        if (!params?.id) return;
        const res = await fetch(`/api/owner/events/${params.id}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            `API Error (${res.status}): ${errData.message || "Gagal memuat API"}`,
          );
        }
        const json = await res.json();
        if (json.status === "success") {
          setEvent(json.data);
        }
      } catch (error: any) {
        console.error("Error memuat detail event:", error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [params]);

  const t = {
    id: {
      back: "Kembali ke Laporan",
      loading: "Memuat rincian detail event...",
      noData: "Detail event tidak ditemukan.",
      noFreelancer: "Belum ada penugasan freelancer.",
      sectionClient: "Informasi Klien",
      sectionCrew: "Freelancer Bertugas",
      sectionNotes: "Catatan & Tema Produksi",
      sectionBilling: "Rincian Biaya & Layanan",
      colItem: "Nama Layanan / Item",
      colQty: "Jumlah",
      colPrice: "Harga Satuan",
      colSubtotal: "Subtotal",
      totalPrice: "Total Harga Final",
      lblDate: "Tanggal Event",
      lblTime: "Waktu Pelaksanaan",
      lblStart: "Jam Mulai:",
      lblEnd: "Jam Selesai:",
      lblLocation: "Lokasi Penyelenggaraan",
      lblClientName: "Nama Lengkap Klien",
      lblClientPhone: "No. WhatsApp / Telepon",
      lblClientEmail: "Alamat Email",
      backdrop: "Tema Backdrop",
      frame: "Teks pada Frame",
      notes: "Catatan Operasional",
      payPaid: "Lunas",
      payPartial: "DP (Sebagian)",
      payUnpaid: "Belum Dibayar",
      payOverdue: "Overdue",
      status: {
        upcoming: "Akan Datang",
        ongoing: "Berlangsung",
        completed: "Selesai",
        canceled: "Dibatalkan",
      },
    },
    en: {
      back: "Back to Reports",
      loading: "Loading event details...",
      noData: "Event details not found.",
      noFreelancer: "No freelancers assigned yet.",
      sectionClient: "Client Information",
      sectionCrew: "Assigned Freelancers",
      sectionNotes: "Production Notes & Themes",
      sectionBilling: "Service & Pricing Breakdown",
      colItem: "Service / Item Name",
      colQty: "Qty",
      colPrice: "Unit Price",
      colSubtotal: "Subtotal",
      totalPrice: "Final Total Price",
      lblDate: "Event Date",
      lblTime: "Execution Time",
      lblStart: "Start Time:",
      lblEnd: "End Time:",
      lblLocation: "Event Location",
      lblClientName: "Client Full Name",
      lblClientPhone: "Phone / WhatsApp Number",
      lblClientEmail: "Email Address",
      backdrop: "Backdrop Theme",
      frame: "Frame Text",
      notes: "Operational Notes",
      payPaid: "Paid Off",
      payPartial: "Partial (DP)",
      payUnpaid: "Unpaid",
      payOverdue: "Overdue",
      status: {
        upcoming: "Upcoming",
        ongoing: "Ongoing",
        completed: "Completed",
        canceled: "Canceled",
      },
    },
  }[lang === "id" ? "id" : "en"];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatTitleCase = (str: string) => {
    if (!str || str === "-") return "-";
    return str
      .toLowerCase()
      .replace(/(?:^|[\s(])\w/g, (match) => match.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-medium">{t.loading}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12 text-rose-500 font-medium">
        {t.noData}
      </div>
    );
  }

  const timeString = event.event_time || "";
  const timeParts = timeString.split("-");
  const startTime = timeParts[0]?.trim() || "-";
  const endTime = timeParts[1]?.trim() || "-";
  const discountAmount = event.invoice?.discount_amount || 0;
  const paidAmount = event.invoice?.paid_amount || 0;
  const finalTotal = Math.max(0, (event.total_price || 0) - discountAmount);

  const isCancelled =
    (event.status || "").toLowerCase() === "cancelled" ||
    (event.status || "").toLowerCase() === "batal";
  const balanceAmount = isCancelled ? 0 : Math.max(0, finalTotal - paidAmount);

  const isB2B = (event.client?.type || "").toUpperCase() === "B2B";

  // --- LOGIKA STATUS KRONOLOGIS FISIK (Real-time) ---
  const getChronologicalStatus = (evt: any) => {
    if (isCancelled) return "canceled";
    if ((evt.status || "").toLowerCase() === "done") return "completed";

    const now = new Date();
    if (!evt.event_date) return "upcoming";

    const eventDate = new Date(evt.event_date);
    if (isNaN(eventDate.getTime())) return "upcoming";

    let startHour = 0,
      startMinute = 0,
      endHour = 23,
      endMinute = 59;
    if (evt.event_time && evt.event_time.includes("-")) {
      const parts = evt.event_time.split("-").map((p: string) => p.trim());
      if (parts[0] && parts[0].includes(":")) {
        const [h, m] = parts[0].split(":").map(Number);
        if (!isNaN(h)) {
          startHour = h;
          startMinute = m;
        }
      }
      if (parts[1] && parts[1].includes(":")) {
        const [h, m] = parts[1].split(":").map(Number);
        if (!isNaN(h)) {
          endHour = h;
          endMinute = m;
        }
      }
    }

    const start = new Date(eventDate);
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date(eventDate);
    end.setHours(endHour, endMinute, 59, 999);

    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "ongoing";
    return "completed";
  };

  const chronoStatus = getChronologicalStatus(event);
  const chronoConfig = {
    upcoming: {
      label: t.status.upcoming,
      className:
        "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
      icon: <CalendarClock className="w-3.5 h-3.5" />,
    },
    ongoing: {
      label: t.status.ongoing,
      className:
        "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    completed: {
      label: t.status.completed,
      className:
        "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    canceled: {
      label: t.status.canceled,
      className:
        "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  }[chronoStatus];

  // --- LOGIKA STATUS PEMBAYARAN PRESISI ---
  const getPaymentStatusInfo = (cStatus: string) => {
    let pStatus = "unpaid";

    if (paidAmount >= finalTotal && finalTotal > 0) {
      pStatus = "paid";
    } else if (paidAmount > 0) {
      pStatus = "dp";
    }

    if (pStatus !== "paid" && cStatus === "completed" && !isCancelled) {
      pStatus = "overdue";
    }

    switch (pStatus) {
      case "paid":
        return {
          label: t.payPaid,
          className:
            "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case "dp":
        return {
          label: t.payPartial,
          className:
            "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
          icon: <Banknote className="w-3.5 h-3.5" />,
        };
      case "overdue":
        return {
          label: t.payOverdue,
          className:
            "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
        };
      default:
        return {
          label: t.payUnpaid,
          className:
            "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
          icon: <Banknote className="w-3.5 h-3.5" />,
        };
    }
  };

  const payStatus = getPaymentStatusInfo(chronoStatus);

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

      {/* HEADER UTAMA DENGAN BADGE DIVISI & STATUS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white capitalize tracking-tight">
              {event.event_name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm font-semibold text-primary capitalize">
                {event.client.name}
              </p>
              {event.client.type && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    isB2B
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                      : "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
                  }`}
                >
                  {event.client.type}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0 w-full md:w-auto">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border tracking-wider uppercase w-full justify-center sm:w-auto ${chronoConfig.className}`}
            >
              {chronoConfig.icon} {chronoConfig.label}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border tracking-wider uppercase w-full justify-center sm:w-auto ${payStatus.className}`}
            >
              {payStatus.icon} {payStatus.label}
            </span>
          </div>
        </div>

        {/* META DATA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 shrink-0">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                {t.lblDate}
              </span>
              <p className="text-sm font-normal text-slate-600 dark:text-slate-300 mt-1">
                {new Date(event.event_date).toLocaleDateString("id-ID", {
                  dateStyle: "long",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                {t.lblTime}
              </span>
              <div className="text-sm font-normal text-slate-606 dark:text-slate-300 mt-1 space-y-1">
                <p>
                  <span className="text-slate-400 text-xs mr-1">
                    {t.lblStart}
                  </span>{" "}
                  {startTime}
                </p>
                <p>
                  <span className="text-slate-400 text-xs mr-1">
                    {t.lblEnd}
                  </span>{" "}
                  {endTime}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                {t.lblLocation}
              </span>
              <p className="text-sm font-normal text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {event.location}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INFORMASI KLIEN */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> {t.sectionClient}
          </h3>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {t.lblClientName}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {event.client.name}
                  </p>
                  {event.client.type && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        isB2B
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                          : "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
                      }`}
                    >
                      {event.client.type}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {t.lblClientPhone}
                </span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 font-mono">
                  {event.client.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {t.lblClientEmail}
                </span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 font-mono">
                  {event.client.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* KRU BERGABUNG */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" /> {t.sectionCrew}
          </h3>
          {event.crew.length > 0 ? (
            <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
              {event.crew.map((crew: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">
                      {crew.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden pl-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-white capitalize truncate">
                        {crew.name}
                      </p>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        {crew.phone || "-"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-lg uppercase tracking-wider whitespace-nowrap text-right">
                    {crew.assigned_role}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-slate-400 italic">
              {t.noFreelancer}
            </div>
          )}
        </div>

        {/* PRODUCTION NOTES & THEMES */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> {t.sectionNotes}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 shrink-0">
                <Layout className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {t.backdrop}
                </span>
                <p className="text-sm font-normal text-slate-800 dark:text-slate-200 mt-1">
                  {formatTitleCase(
                    event.backdrop || event.backdrop_theme || "-",
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800/40">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 shrink-0 mt-0.5">
                <StickyNote className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {t.notes}
                </span>
                <p className="text-sm font-normal text-slate-600 dark:text-slate-300 leading-relaxed mt-1 whitespace-pre-wrap">
                  {event.notes || "Tidak ada catatan operasional khusus."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TABEL DATA TRANSAKSI */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              {t.sectionBilling}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 px-6">{t.colItem}</th>
                  <th className="py-3 px-6 text-center">{t.colQty}</th>
                  <th className="py-3 px-6 text-right">{t.colPrice}</th>
                  <th className="py-3 px-6 text-right">{t.colSubtotal}</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800/50">
                {event.items.map((item: any, idx: number) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="py-3.5 px-6 font-medium text-slate-800 dark:text-white capitalize">
                      {item.item_name}
                      <span className="block text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-wider">
                        {item.item_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center font-mono font-semibold">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-medium text-slate-500">
                      {formatRupiah(item.item_price)}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                      {formatRupiah(item.subtotal)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50/80 dark:bg-slate-800/40 font-bold border-t-2 border-slate-200 dark:border-slate-800">
                  <td
                    colSpan={3}
                    className="py-4 px-6 text-slate-700 dark:text-slate-300 text-right uppercase tracking-wider text-xs font-black"
                  >
                    {lang === "id" ? "Total Sebelum Diskon" : "Gross Total"}
                  </td>
                  <td className="py-4 px-6 text-right text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatRupiah(event.total_price)}
                  </td>
                </tr>
                <tr className="bg-slate-50/40 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800/60">
                  <td
                    colSpan={3}
                    className="py-3 px-6 text-slate-500 dark:text-slate-400 text-right uppercase tracking-wider text-[10px] font-black"
                  >
                    Potongan Harga
                  </td>
                  <td className="py-3 px-6 text-right font-black text-rose-500 font-mono">
                    -{formatRupiah(discountAmount)}
                  </td>
                </tr>
                <tr className="bg-slate-50/80 dark:bg-slate-800/40 font-bold border-t-2 border-slate-200 dark:border-slate-800">
                  <td
                    colSpan={3}
                    className="py-4 px-6 text-slate-700 dark:text-slate-300 text-right uppercase tracking-wider text-xs font-black"
                  >
                    Total Setelah Diskon
                  </td>
                  <td className="py-4 px-6 text-right text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatRupiah(finalTotal)}
                  </td>
                </tr>
                <tr className="bg-slate-50/40 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800/60">
                  <td
                    colSpan={3}
                    className="py-3 px-6 text-slate-500 dark:text-slate-400 text-right uppercase tracking-wider text-[10px] font-black"
                  >
                    {lang === "id" ? "Sudah Dibayarkan" : "Amount Paid"}
                  </td>
                  <td className="py-3 px-6 text-right font-black text-blue-600 dark:text-blue-400 font-mono">
                    {formatRupiah(paidAmount)}
                  </td>
                </tr>
                <tr className="bg-slate-50/80 dark:bg-slate-800/40 font-bold border-t-2 border-slate-200 dark:border-slate-800">
                  <td
                    colSpan={3}
                    className="py-4 px-6 text-slate-700 dark:text-slate-300 text-right uppercase tracking-wider text-xs font-black"
                  >
                    {lang === "id" ? "Sisa Tagihan" : "Remaining Balance"}
                  </td>
                  <td className="py-4 px-6 text-right text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
                    {formatRupiah(balanceAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

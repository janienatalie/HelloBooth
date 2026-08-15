// src/app/admin/invoices/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Send,
  CheckCircle,
  CreditCard,
  X,
} from "lucide-react";
import { useLanguage } from "@/providers/AppProvider";

export default function InvoiceDetailPage() {
  const params = useParams();
  const { lang } = useLanguage();
  const id = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [financial, setFinancial] = useState({
    subtotal: 0,
    discount: 0,
    paid: 0,
  });

  const parseCurrencyInput = (value: string) => {
    const digitsOnly = value.replace(/[^0-9]/g, "");
    return digitsOnly === "" ? 0 : Number(digitsOnly);
  };

  const formatCurrencyInput = (value: number) => {
    if (!value) return "";
    return new Intl.NumberFormat("id-ID").format(value);
  };

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/invoices/${id}`);
        const json = await res.json();

        if (json.status === "success") {
          setInvoiceData(json.data);
          setFinancial(json.data.financial);
        }
      } catch (error) {
        console.error("Gagal memuat invoice", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchInvoice();
  }, [id]);

  const totalTagihan = Math.max(0, financial.subtotal - financial.discount);
  const sisaTagihan = totalTagihan - financial.paid;

  // Status diambil langsung dari perhitungan akurat Backend
  const currentStatus = invoiceData?.status || "Belum Dibayar";
  const isFullyPaid = currentStatus === "Lunas";
  const isOverdue = currentStatus === "Overdue";

  const handleUpdatePayment = async () => {
    // Validasi minimal DP Rp 500.000 jika belum lunas
    if (
      financial.paid > 0 &&
      financial.paid < 500000 &&
      financial.paid < totalTagihan
    ) {
      alert("Minimal pembayaran awal adalah Rp 500.000");
      return;
    }

    try {
      // HANYA MENGIRIMKAN ANGKA KE BACKEND (Tidak mengirim status Event)
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paidAmount:
            financial.paid >= totalTagihan ? totalTagihan : financial.paid,
          discountAmount: financial.discount,
          subtotal: financial.subtotal,
        }),
      });

      if (res.ok) {
        alert("Pembayaran berhasil diperbarui!");
        setIsModalOpen(false);
        window.location.reload();
      } else {
        const err = await res.json();
        alert(`Gagal menyimpan: ${err.message || "Kesalahan database"}`);
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat menyimpan pembayaran.");
    }
  };

  const t = {
    id: {
      back: "Kembali ke Daftar",
      print: "Cetak PDF",
      send: "Kirim via WhatsApp",
      update: "Update Pembayaran",
      billTo: "Ditagihkan Kepada",
      eventDetail: "Detail Pelaksanaan",
      itemDesc: "Deskripsi Layanan",
      itemQty: "Jumlah",
      itemPrice: "Harga Satuan",
      itemTotal: "Total",
      subtotal: "Subtotal",
      total: "Total Tagihan",
      paid: "Sudah Dibayar",
      balance: "Sisa Tagihan",
      statusPaid: "LUNAS",
      statusPartial: "DP TERBAYAR",
      statusOverdue: "OVERDUE",
      statusUnpaid: "MENUNGGU PEMBAYARAN",
      capPaid: "LUNAS",
      capDate: "DIVERIFIKASI",
      notes:
        "Catatan: Pembayaran sah jika sudah masuk ke rekening resmi Hellobooth (BCA 1234567890 a.n PT Hello Booth Indonesia).",
      save: "Simpan Perubahan",
      invoiceDate: "Tanggal Invoice",
    },
    en: {
      back: "Back to List",
      print: "Print PDF",
      send: "Send via WhatsApp",
      update: "Update Payment",
      billTo: "Billed To",
      eventDetail: "Event Details",
      itemDesc: "Service Description",
      itemQty: "Qty",
      itemPrice: "Unit Price",
      itemTotal: "Total",
      subtotal: "Subtotal",
      total: "Total Amount",
      paid: "Amount Paid",
      balance: "Remaining Balance",
      statusPaid: "FULLY PAID",
      statusPartial: "DP PAID",
      statusOverdue: "OVERDUE",
      statusUnpaid: "PENDING PAYMENT",
      capPaid: "PAID",
      capDate: "VERIFIED",
      notes:
        "Notes: Payment is valid once received in Hellobooth official account (BCA 1234567890 a.n PT Hello Booth Indonesia).",
      save: "Save Changes",
      invoiceDate: "Invoice date",
    },
  }[lang === "id" ? "id" : "en"];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const getStatusStyle = () => {
    if (isFullyPaid) return "bg-emerald-600 text-white";
    if (isOverdue) return "bg-rose-600 text-white font-black tracking-[0.3em]";
    if (currentStatus === "DP (Sebagian)") return "bg-amber-500 text-white";
    return "bg-slate-500 text-white";
  };

  if (isLoading || !invoiceData) {
    return (
      <div className="p-10 text-center animate-pulse text-slate-500">
        Mempersiapkan Dokumen Invoice...
      </div>
    );
  }

  let waUrl = "#";
  if (invoiceData) {
    let phone = invoiceData.client.phone || "";
    phone = phone.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "62" + phone.substring(1);

    const listLayanan = invoiceData.items
      .map((item: any) => item.desc)
      .join(" + ");
    const msg =
      `Hello ${invoiceData.client.name}!\n\n` +
      `Perkenalkan aku Anisa dari HelloBooth. Terima kasih ya kak telah mempercayai HelloBooth sebagai vendor photobooth untuk pernikahanmu nanti☺️\n\n` +
      `Aku ingin konfirmasi layanan yang kamu pesan ya kak:\n` +
      `${listLayanan} dengan total ${formatRupiah(totalTagihan)}\n\n` +
      (financial.discount > 0
        ? `Potongan harga ${formatRupiah(financial.discount)}\n`
        : "") +
      `Pembayaran yang sudah kami terima sebesar ${formatRupiah(financial.paid)}\n` +
      `Serta sisa pelunasan ${formatRupiah(sisaTagihan)}\n\n` +
      `Untuk pelunasan dapat dilakukan H-3 Sebelum Tanggal pernikahan\n` +
      `Berikut aku lampirkan kwitansi pembayarannya ya kak`;

    waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 relative overflow-visible">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0.5cm;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          nav,
          sidebar,
          header,
          footer,
          .print-hidden {
            display: none !important;
          }
          .invoice-card {
            background-color: white !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .print-text-black {
            color: black !important;
          }
          .printed-stamps {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {/* ACTION BUTTONS */}
      <div className="flex justify-between items-center print:hidden">
        <Link
          href="/admin/invoices"
          className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary rounded-xl transition-all text-xs font-semibold shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
          <span>{t.back}</span>
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-primary px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <CreditCard className="w-4 h-4" /> {t.update}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" /> {t.print}
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-md hover:cursor-pointer"
          >
            <Send className="w-4 h-4" /> {t.send}
          </a>
        </div>
      </div>

      {/* DOKUMEN INVOICE */}
      <div className="invoice-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden print:bg-white relative">
        <div
          className={`px-8 py-1.5 text-center text-[10px] font-black tracking-[0.2em] ${getStatusStyle()}`}
        >
          {isFullyPaid
            ? t.statusPaid
            : isOverdue
              ? t.statusOverdue
              : financial.paid > 0
                ? t.statusPartial
                : t.statusUnpaid}
        </div>

        <div className="p-6 md:p-8 space-y-6 relative">
          <div className="absolute bottom-16 right-32 w-64 h-32 printed-stamps opacity-60 pointer-events-none z-10 flex items-center justify-center">
            <div className="w-26 h-26 rounded-full border-4 border-slate-200 dark:border-slate-200 opacity-60 p-2 flex items-center justify-center rotate-12 transform">
              <div className="relative w-full h-full">
                <Image
                  src="/images/logo-hellobooth.png"
                  alt="Stamp Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            {isFullyPaid && (
              <div className="absolute inset-0 flex items-center justify-center animate-in fade-in zoom-in-125 duration-500">
                <div className="w-32 h-32 rounded-full border-[6px] border-emerald-600/70 p-1 flex items-center justify-center -rotate-12 transform shadow-lg bg-white/10 backdrop-blur-[1px]">
                  <div className="w-full h-full rounded-full border-2 border-emerald-600/50 flex flex-col items-center justify-center text-emerald-700 font-black">
                    <span className="text-3xl leading-none tracking-tighter">
                      {t.capPaid}
                    </span>
                    <span className="text-[9px] tracking-[0.3em] uppercase mt-1">
                      {t.capDate}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-start relative z-0">
            <div className="space-y-1">
              <div className="relative w-40 h-11 ">
                <Image
                  src="/images/logo-hellobooth.png"
                  alt="Logo"
                  fill
                  priority
                  className="object-contain object-left"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-700 leading-tight pt-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 print-text-black">
                  PT Hello Booth Indonesia
                </span>{" "}
                <br />
                hello@hellobooth.id | +62 21 555 1234
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-black text-slate-400 dark:text-slate-600 tracking-tighter uppercase">
                INVOICE
              </h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 print-text-black">
                {t.invoiceDate}:{" "}
                <span className="text-slate-800 dark:text-slate-200">
                  {lang === "id" ? invoiceData.date.id : invoiceData.date.en}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 border-y border-slate-100 dark:border-slate-800 print:border-slate-300 py-3.5 relative z-0">
            <div className="text-xs space-y-0.5">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {t.billTo}
              </p>
              <p className="font-black text-slate-800 dark:text-white print-text-black">
                {invoiceData.client.name}
              </p>
              <p className="opacity-80 print-text-black">
                {invoiceData.client.phone} • {invoiceData.client.address}
              </p>
            </div>
            <div className="text-xs space-y-0.5">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {t.eventDetail}
              </p>
              <p className="font-bold text-slate-800 dark:text-white print-text-black">
                {invoiceData.event.name}
              </p>
              <p className="opacity-80 print-text-black">
                {lang === "id"
                  ? invoiceData.event.date.id
                  : invoiceData.event.date.en}{" "}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto relative z-0">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 print:border-slate-300">
                  <th className="pb-2 px-1">{t.itemDesc}</th>
                  <th className="pb-2 px-1 text-center w-20">{t.itemQty}</th>
                  <th className="pb-2 px-1 text-right w-36">{t.itemPrice}</th>
                  <th className="pb-4 px-1 text-right w-36">{t.itemTotal}</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item: any, idx: number) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-50 dark:border-slate-800/50 print:border-slate-200"
                  >
                    <td className="py-2 px-1 font-semibold text-slate-700 dark:text-slate-200 print-text-black">
                      {item.desc}
                    </td>
                    <td className="py-2 px-1 text-center text-slate-500 print-text-black">
                      {item.qty}
                    </td>
                    <td className="py-2 px-1 text-right text-slate-500 print-text-black">
                      {formatRupiah(item.price)}
                    </td>
                    <td className="py-2 px-1 text-right font-bold text-slate-800 dark:text-white print-text-black">
                      {formatRupiah(item.qty * item.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-12 gap-6 pt-1 relative z-0">
            <div className="col-span-7 text-[10px] text-slate-700 dark:text-slate-300 italic flex items-end">
              <p className="leading-relaxed border-l-2 border-slate-200 dark:border-slate-800 print:border-slate-300 pl-3">
                {t.notes}
              </p>
            </div>
            <div className="col-span-5 space-y-1.5 text-xs ml-auto w-full relative">
              <div className="flex justify-between text-slate-500 dark:text-slate-400 print-text-black">
                <span>{t.subtotal}</span>
                <span className="font-mono">
                  {formatRupiah(financial.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400 print-text-black">
                <span>Diskon / Potongan</span>
                <span className="font-mono">
                  -{formatRupiah(financial.discount)}
                </span>
              </div>
              <div className="flex justify-between font-black text-slate-800 dark:text-white print-text-black border-t pt-1.5 border-slate-100 dark:border-slate-800">
                <span>{t.total}</span>
                <span className="font-mono">{formatRupiah(totalTagihan)}</span>
              </div>
              <div
                className={`flex justify-between font-bold ${isFullyPaid ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300"}`}
              >
                <span>{t.paid}</span>
                <span className="font-mono">
                  {formatRupiah(financial.paid)}
                </span>
              </div>
              <div
                className={`flex justify-between font-black text-sm p-2 rounded-xl mt-0.5 ${isFullyPaid ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" : "bg-primary/5 dark:bg-slate-800 text-primary dark:text-white"}`}
              >
                <span>{t.balance}</span>
                <span className="font-mono">{formatRupiah(sisaTagihan)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL UPDATE PEMBAYARAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 print:hidden">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-white leading-none">
                    {t.update}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  {t.paid}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatCurrencyInput(financial.paid)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFinancial({
                        ...financial,
                        paid: parseCurrencyInput(val),
                      });
                    }}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Diskon / Potongan Harga
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatCurrencyInput(financial.discount)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFinancial({
                        ...financial,
                        discount: parseCurrencyInput(val),
                      });
                    }}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10 space-y-2">
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Total Tagihan:</span>
                  <span className="font-bold">
                    {formatRupiah(totalTagihan)}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-black text-primary">
                  <span>Sisa Tagihan:</span>
                  <span>{formatRupiah(sisaTagihan)}</span>
                </div>
              </div>

              <button
                onClick={handleUpdatePayment}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-lg hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" /> {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

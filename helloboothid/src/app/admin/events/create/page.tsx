// src/app/admin/events/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  User,
  CalendarDays,
  Package,
  MapPin,
  Clock,
  PlusCircle,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/providers/AppProvider";
import { clientService } from "@/app/services/clientService";

export default function CreateEventPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const [clients, setClients] = useState<any[]>([]);
  const [masterServices, setMasterServices] = useState<any[]>([]);
  const [masterAddons, setMasterAddons] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================================
  // STATE BARU: Menyimpan data ketersediaan tanggal
  // ==========================================================
  const [bookedDates, setBookedDates] = useState<Record<string, number>>({});
  const [dateWarning, setDateWarning] = useState<string>("");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const resClients = await clientService.getClients();
        setClients(resClients || []);

        const sRes = await fetch("/api/services");
        const sData = await sRes.json();
        // PERBAIKAN: Gunakan sData.data.services agar state berisi array
        if (sData.status === "success")
          setMasterServices(sData.data.services || []);

        const aRes = await fetch("/api/addons");
        const aData = await aRes.json();
        // PERBAIKAN: Gunakan aData.data.addons agar state berisi array
        if (aData.status === "success")
          setMasterAddons(aData.data.addons || []);

        // ==========================================================
        // FETCH DATA KETERSEDIAAN TANGGAL
        // ==========================================================
        const availRes = await fetch("/api/events/availability");
        const availData = await availRes.json();
        if (availData.status === "success") {
          setBookedDates(availData.data);
        }
      } catch (error) {
        console.error("Gagal memuat data master:", error);
      }
    };

    fetchInitialData();
  }, []);

  const [formData, setFormData] = useState({
    client_id: "",
    event_name: "",
    event_date: "",
    startTime: "",
    endTime: "",
    location: "",
  });

  const [selectedServices, setSelectedServices] = useState([
    { item_id: "", quantity: 1, backdrop: "", itemNotes: "" },
  ]);

  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);

  const addServiceRow = () => {
    setSelectedServices([
      ...selectedServices,
      { item_id: "", quantity: 1, backdrop: "", itemNotes: "" },
    ]);
  };

  const addAddonRow = () => {
    setSelectedAddons([...selectedAddons, { item_id: "", quantity: 1 }]);
  };

  const updateService = (index: number, field: string, value: any) => {
    const updated = [...selectedServices];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedServices(updated);
  };

  const updateAddon = (index: number, field: string, value: any) => {
    const updated = [...selectedAddons];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedAddons(updated);
  };

  // ==========================================================
  // LOGIKA PENGECEKAN TANGGAL SAAT DIPILIH
  // ==========================================================
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const currentBooked = bookedDates[selectedDate] || 0;

    if (currentBooked >= 10) {
      setDateWarning(`Kapasitas penuh! Sudah ada 10 event di tanggal ini.`);
      setFormData({ ...formData, event_date: "" }); // Kosongkan input
    } else {
      setDateWarning(""); // Hapus peringatan jika aman
      setFormData({ ...formData, event_date: selectedDate });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id)
      return alert(
        lang === "id"
          ? "Silakan pilih klien terlebih dahulu."
          : "Please select a client first.",
      );

    // Validasi ulang untuk keamanan ganda
    const currentBooked = bookedDates[formData.event_date] || 0;
    if (currentBooked >= 10) {
      return alert(
        lang === "id"
          ? "Tanggal ini sudah penuh. Silakan pilih tanggal lain."
          : "This date is full. Please select another date.",
      );
    }

    setIsSubmitting(true);
    try {
      const items = [
        ...selectedServices.map((s) => {
          const detail = masterServices.find(
            (master) => master.id === s.item_id,
          );
          return {
            ...s,
            item_type: "service",
            name: detail?.name || "",
            price: detail?.price || 0,
          };
        }),
        ...selectedAddons.map((a) => {
          const detail = masterAddons.find((master) => master.id === a.item_id);
          return {
            ...a,
            item_type: "addon",
            name: detail?.name || "",
            price: detail?.price || 0,
          };
        }),
      ];

      const payload = {
        client_id: formData.client_id,
        event_name: formData.event_name,
        event_date: formData.event_date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        event_time: `${formData.startTime} - ${formData.endTime}`,
        location: formData.location,
        backdrop_theme: selectedServices[0]?.backdrop || null,
        notes: selectedServices[0]?.itemNotes || null,
        items: items,
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status === "success") {
        alert(
          lang === "id"
            ? "Event berhasil disimpan!"
            : "Event saved successfully!",
        );
        router.push("/admin/events");
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const translations: any = {
    id: {
      back: "Kembali ke List Event",
      title: "Buat Event Baru",
      subtitle:
        "Isi detail form di bawah untuk membuat jadwal event & booking baru.",
      clientSec: "1. Informasi Klien",
      clientName: "Pilih Nama Klien",
      eventSec: "2. Detail Event",
      eventName: "Nama / Judul Event",
      eventDate: "Tanggal Event",
      startTime: "Waktu Mulai",
      endTime: "Waktu Selesai",
      location: "Lokasi Lengkap",
      packageSec: "3. Paket & Spesifikasi",
      saveBtn: "Simpan & Buat Event",
      cancel: "Batal",
      selectClientPlaceholder: "-- Pilih Klien --",
      addPackageBtn: "TAMBAH PAKET",
      selectPackagePlaceholder: "-- Pilih Layanan --",
      backdropPlaceholder: "-- Pilih Backdrop --",
      noBackdrop: "Tanpa backdrop (disediakan vendor decor)",
      notesLabel: "Catatan Khusus Paket",
      addonsTitle: "Pilih Tambahan (Add-ons)",
      btnAddon: "TAMBAH ADD-ON",
      selectAddonPlaceholder: "-- Pilih Add-on --",
      qtyPlaceholder: "Qty",
      saving: "Menyimpan...",
      quotaRemaining: "Sisa kuota:",
      eventsForThisDate: "event untuk tanggal ini.",
    },
    en: {
      back: "Back to Event List",
      title: "Create New Event",
      subtitle: "Fill in the form details below to create a new event.",
      clientSec: "1. Client Information",
      clientName: "Select Client Name",
      eventSec: "2. Event Details",
      eventName: "Event Name / Title",
      eventDate: "Event Date",
      startTime: "Start Time",
      endTime: "End Time",
      location: "Full Location",
      packageSec: "3. Package & Specification",
      saveBtn: "Save & Create Event",
      cancel: "Cancel",
      selectClientPlaceholder: "-- Select Client --",
      addPackageBtn: "ADD PACKAGE",
      selectPackagePlaceholder: "-- Select Service --",
      backdropPlaceholder: "-- Select Backdrop --",
      noBackdrop: "No backdrop (provided by decor vendor)",
      notesLabel: "Specific Package Notes",
      addonsTitle: "Select Add-ons",
      btnAddon: "ADD ADD-ON",
      selectAddonPlaceholder: "-- Select Add-on --",
      qtyPlaceholder: "Qty",
      saving: "Saving...",
      quotaRemaining: "Remaining quota:",
      eventsForThisDate: "events for this date.",
    },
  };

  const t = translations[lang] || translations.id;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push("/admin/events")}
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:text-primary transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {t.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t.subtitle}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. INFORMASI KLIEN */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> {t.clientSec}
          </h3>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
              {t.clientName}
            </label>
            <select
              required
              value={formData.client_id}
              onChange={(e) =>
                setFormData({ ...formData, client_id: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
            >
              <option value="">{t.selectClientPlaceholder}</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. DETAIL EVENT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-500" /> {t.eventSec}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                {t.eventName}
              </label>
              <input
                type="text"
                required
                value={formData.event_name}
                onChange={(e) =>
                  setFormData({ ...formData, event_name: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
              />
            </div>

            {/* ========================================================== */}
            {/* INPUT TANGGAL (Diperbarui dengan Validasi) */}
            {/* ========================================================== */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                {t.eventDate}
              </label>
              <input
                type="date"
                required
                value={formData.event_date}
                onChange={handleDateChange}
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white ${dateWarning ? "border-rose-500 bg-rose-50 dark:bg-rose-950/30" : "border-slate-200 dark:border-slate-800"}`}
              />

              {/* Notifikasi Kuota (INI YANG AKAN MUNCUL SAAT MENGISI TANGGAL) */}
              {dateWarning ? (
                <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {dateWarning}
                </p>
              ) : formData.event_date ? (
                <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span>
                  {t.quotaRemaining}{" "}
                  {10 - (bookedDates[formData.event_date] || 0)}{" "}
                  {t.eventsForThisDate}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                  {t.startTime}
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                  {t.endTime}
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                {t.location}
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. PAKET & SPESIFIKASI */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-500" /> {t.packageSec}
            </h3>
            <button
              type="button"
              onClick={addServiceRow}
              className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-100 transition-all"
            >
              <PlusCircle className="w-4 h-4" /> {t.addPackageBtn}
            </button>
          </div>

          {selectedServices.map((service, idx) => (
            <div
              key={idx}
              className="p-6 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-950/30 relative space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    {lang === "id"
                      ? "Pilih Paket Layanan"
                      : "Select Service Package"}
                  </label>
                  <select
                    required
                    value={service.item_id}
                    onChange={(e) =>
                      updateService(idx, "item_id", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                  >
                    <option value="">{t.selectPackagePlaceholder}</option>
                    {masterServices.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    {lang === "id"
                      ? "Warna / Tema Backdrop"
                      : "Backdrop Color / Theme"}
                  </label>
                  <select
                    value={service.backdrop}
                    onChange={(e) =>
                      updateService(idx, "backdrop", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                  >
                    <option value="">{t.backdropPlaceholder}</option>
                    <option value="silver">Silver</option>
                    <option value="black">Black</option>
                    <option value="maroon">Maroon</option>
                    <option value="pink">Pink</option>
                    <option value="white">White</option>
                    <option value="gold">Gold</option>
                    <option value="tanpa backdrop (disediakan vendor decor)">
                      {t.noBackdrop}
                    </option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    {t.notesLabel}
                  </label>
                  <textarea
                    rows={2}
                    value={service.itemNotes}
                    onChange={(e) =>
                      updateService(idx, "itemNotes", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm resize-none"
                  ></textarea>
                </div>
              </div>
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedServices(
                      selectedServices.filter((_, i) => i !== idx),
                    )
                  }
                  className="absolute top-4 right-4 text-rose-500 p-1 rounded-md hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {/* ADD-ONS SECTION */}
          <div className="pt-6 border-t border-dashed border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                {t.addonsTitle}
              </h4>
              <button
                type="button"
                onClick={addAddonRow}
                className="text-xs font-bold bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-purple-100 transition-all"
              >
                <PlusCircle className="w-4 h-4" /> {t.btnAddon}
              </button>
            </div>
            <div className="space-y-3">
              {selectedAddons.map((addon: any, idx: number) => (
                <div
                  key={idx}
                  className="flex gap-3 items-center animate-in slide-in-from-right-2 duration-300"
                >
                  <select
                    required
                    value={addon.item_id}
                    onChange={(e) =>
                      updateAddon(idx, "item_id", e.target.value)
                    }
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white outline-none"
                  >
                    <option value="">{t.selectAddonPlaceholder}</option>
                    {masterAddons.map((a: any) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={addon.quantity}
                    onChange={(e) =>
                      updateAddon(idx, "quantity", parseInt(e.target.value))
                    }
                    className="w-24 px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-center dark:text-white outline-none"
                    placeholder={t.qtyPlaceholder}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedAddons(
                        selectedAddons.filter((_, i) => i !== idx),
                      )
                    }
                    className="text-rose-500 p-2 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.push("/admin/events")}
            className="px-8 py-3 text-sm font-bold text-slate-500 hover:text-slate-700"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center gap-2 bg-primary text-white px-10 py-3 rounded-2xl font-black shadow-lg shadow-primary/25 transition-all ${isSubmitting ? "opacity-70" : "hover:bg-primary-hover active:scale-95"}`}
          >
            <Save className="w-4 h-4" /> {isSubmitting ? t.saving : t.saveBtn}
          </button>
        </div>
      </form>
    </div>
  );
}

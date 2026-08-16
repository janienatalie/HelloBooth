// src/app/admin/events/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Save,
  User,
  CalendarDays,
  Package,
  MapPin,
  Clock,
  ArrowLeft,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { useLanguage } from "@/providers/AppProvider";
import { clientService } from "@/app/services/clientService";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const eventId = params?.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State Master Data
  const [clients, setClients] = useState<any[]>([]);
  const [masterServices, setMasterServices] = useState<any[]>([]);
  const [masterAddons, setMasterAddons] = useState<any[]>([]);

  // State Form Utama
  const [formData, setFormData] = useState({
    client_id: "",
    event_name: "",
    event_date: "",
    startTime: "",
    endTime: "",
    location: "",
  });

  // State Layanan & Addons (Diperbarui untuk mendukung Bundling)
  const [selectedServices, setSelectedServices] = useState<any[]>([
    { item_id: "", quantity: 1, backdrop: "", itemNotes: "" },
  ]);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);

  // --- KAMUS BAHASA ---
  const t = {
    id: {
      loading: "Memuat Data Event...",
      title: "Edit Data Event",
      subtitle: "Perbarui informasi untuk ID",
      sectionClient: "1. Informasi Klien",
      selectClientTitle: "Pilih Klien",
      selectClientPlaceholder: "-- Pilih Klien --",
      sectionEvent: "2. Detail Event",
      eventName: "Nama / Judul Event",
      eventDate: "Tanggal Event",
      start: "Mulai",
      end: "Selesai",
      location: "Lokasi",
      sectionPackage: "3. Paket & Spesifikasi",
      addPackageBtn: "TAMBAH PAKET",
      selectPackageTitle: "Pilih Paket Layanan",
      selectPackagePlaceholder: "-- Pilih Layanan --",
      backdrop: "Warna / Tema Backdrop",
      selectBackdropPlaceholder: "-- Pilih Backdrop --",
      noBackdrop: "Tanpa backdrop (disediakan vendor decor)",
      notes: "Catatan Khusus Paket",
      addonsTitle: "Pilih Tambahan (Add-ons)",
      btnAddon: "TAMBAH ADD-ON",
      selectAddonPlaceholder: "-- Pilih Add-on --",
      cancel: "Batal",
      saving: "Menyimpan...",
      save: "Simpan Perubahan",
      alertSuccess: "Perubahan event berhasil disimpan!",
      alertFail: "Gagal menyimpan: ",
      alertError: "Terjadi kesalahan sistem saat menyimpan.",
    },
    en: {
      loading: "Loading Event Data...",
      title: "Edit Event Data",
      subtitle: "Update information for ID",
      sectionClient: "1. Client Information",
      selectClientTitle: "Select Client",
      selectClientPlaceholder: "-- Select Client --",
      sectionEvent: "2. Event Details",
      eventName: "Event Name / Title",
      eventDate: "Event Date",
      start: "Start",
      end: "End",
      location: "Location",
      sectionPackage: "3. Package & Specifications",
      addPackageBtn: "ADD PACKAGE",
      selectPackageTitle: "Select Service Package",
      selectPackagePlaceholder: "-- Select Service --",
      backdrop: "Backdrop Color / Theme",
      selectBackdropPlaceholder: "-- Select Backdrop --",
      noBackdrop: "No Backdrop (Provided by Decor Vendor)",
      notes: "Specific Package Notes",
      addonsTitle: "Select Add-ons",
      btnAddon: "ADD ADD-ON",
      selectAddonPlaceholder: "-- Select Add-on --",
      cancel: "Cancel",
      saving: "Saving...",
      save: "Save Changes",
      alertSuccess: "Event changes saved successfully!",
      alertFail: "Failed to save: ",
      alertError: "System error occurred while saving.",
    },
  }[lang === "id" ? "id" : "en"];

  // Fetch Data Awal
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);

        const resClients = await clientService.getClients();
        setClients(resClients || []);

        const sRes = await fetch("/api/services");
        const sData = await sRes.json();
        // PERBAIKAN: Mengambil data array .services dari API
        if (sData.status === "success")
          setMasterServices(sData.data.services || []);

        const aRes = await fetch("/api/addons");
        const aData = await aRes.json();
        // PERBAIKAN: Mengambil data array .addons dari API
        if (aData.status === "success")
          setMasterAddons(aData.data.addons || []);

        const evRes = await fetch(`/api/events/${eventId}`);
        const evData = await evRes.json();

        if (evData.status === "success") {
          const ev = evData.data;

          let st = "",
            et = "";
          if (ev.event_time && ev.event_time.includes("-")) {
            const parts = ev.event_time.split("-");
            st = parts[0].trim();
            et = parts[1].trim();
          }

          let formattedDate = "";
          if (ev.event_date) {
            const d = new Date(ev.event_date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            formattedDate = `${year}-${month}-${day}`;
          }

          setFormData({
            client_id: ev.client_id || "",
            event_name: ev.event_name || "",
            event_date: formattedDate,
            startTime: st,
            endTime: et,
            location: ev.location || "",
          });

          if (ev.items && ev.items.length > 0) {
            const services = ev.items
              .filter((i: any) => i.item_type === "service")
              .map((s: any) => ({
                item_id: s.item_id,
                quantity: s.quantity || 1,
                backdrop: s.backdrop || s.backdrop_theme || "",
                itemNotes: s.notes || s.itemNotes || ev.notes || "",
              }));

            const addons = ev.items
              .filter((i: any) => i.item_type === "addon")
              .map((a: any) => ({
                item_id: a.item_id,
                quantity: a.quantity || 1,
              }));

            if (services.length > 0) setSelectedServices(services);
            if (addons.length > 0) setSelectedAddons(addons);
          }
        }
      } catch (error) {
        console.error("Gagal memuat data event:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) fetchAllData();
  }, [eventId]);

  const addServiceRow = () => {
    setSelectedServices([
      ...selectedServices,
      { item_id: "", quantity: 1, backdrop: "", itemNotes: "" },
    ]);
  };

  const updateService = (index: number, field: string, value: any) => {
    const updated = [...selectedServices];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedServices(updated);
  };

  const addAddonRow = () =>
    setSelectedAddons([...selectedAddons, { item_id: "", quantity: 1 }]);

  const updateAddon = (index: number, field: string, value: any) => {
    const updated = [...selectedAddons];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedAddons(updated);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const itemsPayload = [
        ...selectedServices.map((s) => {
          const detail = masterServices.find(
            (m) => String(m.id) === String(s.item_id),
          );
          return {
            ...s,
            item_type: "service",
            name: detail?.name || "",
            price: detail?.price || 0,
          };
        }),
        ...selectedAddons.map((a) => {
          const detail = masterAddons.find(
            (m) => String(m.id) === String(a.item_id),
          );
          return {
            ...a,
            item_type: "addon",
            name: detail?.name || "",
            price: detail?.price || 0,
          };
        }),
      ];

      const payload = {
        ...formData,
        event_time: `${formData.startTime} - ${formData.endTime}`,
        backdrop_theme: selectedServices[0]?.backdrop || null, // Global fallback
        notes: selectedServices[0]?.itemNotes || null, // Global fallback
        items: itemsPayload,
      };

      const res = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status === "success") {
        alert(t.alertSuccess);
        router.push(`/admin/events/${eventId}`);
      } else {
        alert(t.alertFail + data.message);
      }
    } catch (error) {
      alert(t.alertError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 text-slate-500 font-semibold animate-pulse">
        {t.loading}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push(`/admin/events/${eventId}`)}
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:text-primary transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {t.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.subtitle} <span className="font-mono font-bold">{eventId}</span>.
          </p>
        </div>
      </div>

      <form onSubmit={handleUpdateEvent} className="space-y-6">
        {/* SECTION 1: Klien */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-primary-light dark:bg-primary/20 text-primary rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {t.sectionClient}
            </h3>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t.selectClientTitle} <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.client_id}
              onChange={(e) =>
                setFormData({ ...formData, client_id: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
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

        {/* SECTION 2: Event */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {t.sectionEvent}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t.eventName} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.event_name}
                onChange={(e) =>
                  setFormData({ ...formData, event_name: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" /> {t.eventDate}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.event_date}
                onChange={(e) =>
                  setFormData({ ...formData, event_date: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {t.start}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  {t.end} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {t.location}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 dark:text-white resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* SECTION 3: Paket & Teknis (Mendukung Bundling) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-500" /> {t.sectionPackage}
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
                    {t.selectPackageTitle}
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
                    {t.backdrop}
                  </label>
                  <select
                    value={service.backdrop}
                    onChange={(e) =>
                      updateService(idx, "backdrop", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                  >
                    <option value="">{t.selectBackdropPlaceholder}</option>
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
                    {t.notes}
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
                    placeholder="Qty"
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

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.push(`/admin/events/${eventId}`)}
            className="px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-hover rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isSubmitting ? t.saving : t.save}
          </button>
        </div>
      </form>
    </div>
  );
}

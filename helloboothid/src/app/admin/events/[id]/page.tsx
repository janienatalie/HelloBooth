// src/app/admin/events/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  Edit,
  Users,
  UserPlus,
  Trash2,
  Shield,
  Loader2,
  X,
  AlertTriangle,
  PlusCircle,
  XCircle,
  CalendarClock,
  Activity,
} from "lucide-react";
import { useLanguage } from "@/providers/AppProvider";

// HELPER: Menghitung status kronologis untuk Event Manager
function getEventChronologicalStatus(event: any) {
  if (!event) return "upcoming";

  if (
    (event.status || "").toLowerCase() === "cancelled" ||
    (event.status || "").toLowerCase() === "batal"
  ) {
    return "canceled";
  }

  if ((event.status || "").toLowerCase() === "done") {
    return "completed";
  }

  const now = new Date();
  if (!event.event_date) return "upcoming";

  const eventDate = new Date(event.event_date);
  if (isNaN(eventDate.getTime())) return "upcoming";

  let startHour = 0;
  let startMinute = 0;
  let endHour = 23;
  let endMinute = 59;

  if (event.event_time && event.event_time.includes("-")) {
    const parts = event.event_time.split("-").map((p: string) => p.trim());

    if (parts[0] && parts[0].includes(":")) {
      const [h, m] = parts[0].split(":").map(Number);
      if (!isNaN(h)) startHour = h;
      if (!isNaN(m)) startMinute = m;
    }

    if (parts[1] && parts[1].includes(":")) {
      const [h, m] = parts[1].split(":").map(Number);
      if (!isNaN(h)) endHour = h;
      if (!isNaN(m)) endMinute = m;
    }
  }

  const startDateTime = new Date(eventDate);
  startDateTime.setHours(startHour, startMinute, 0, 0);

  const endDateTime = new Date(eventDate);
  endDateTime.setHours(endHour, endMinute, 59, 999);

  if (now < startDateTime) return "upcoming";
  if (now >= startDateTime && now <= endDateTime) return "ongoing";
  return "completed";
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const eventId = params?.id as string;

  // --- STATE UTAMA ---
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [availableFreelancers, setAvailableFreelancers] = useState<any[]>([]);

  // --- STATE UI ---
  const [currentStatus, setCurrentStatus] = useState("");
  const [isCrewModalOpen, setIsCrewModalOpen] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState("");
  const [assignedRole, setAssignedRole] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // --- 1. FETCH DATA DETAIL ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventRes, freelancerRes] = await Promise.all([
          fetch(`/api/events/${eventId}?t=${Date.now()}`),
          fetch("/api/freelancers"),
        ]);

        const eventJson = await eventRes.json();
        const freelancerJson = await freelancerRes.json();

        if (eventJson.status === "success") {
          const rawData = eventJson.data;
          const validStatus = (rawData.status || "inquiry").toLowerCase();

          setEventData({ ...rawData, status: validStatus });
          setCurrentStatus(validStatus);
        }
        if (freelancerJson.status === "success") {
          setAvailableFreelancers(freelancerJson.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) fetchData();
  }, [eventId]);

  const refreshEventData = async () => {
    const res = await fetch(`/api/events/${eventId}?t=${Date.now()}`);
    const json = await res.json();
    if (json.status === "success") {
      const validStatus = (json.data.status || "inquiry").toLowerCase();
      setEventData({ ...json.data, status: validStatus });
      setCurrentStatus(validStatus);
    }
  };

  // --- 2. LOGIKA UPDATE STATUS MANUAL (Hanya untuk Batal) ---
  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCurrentStatus(newStatus);
        setEventData({
          ...eventData,
          status: newStatus,
          crew: newStatus === "cancelled" ? [] : eventData.crew,
        });
      }
    } catch (err) {
      alert("Gagal memperbarui status");
    } finally {
      setIsUpdating(false);
      setShowCancelModal(false);
    }
  };

  // --- 3. LOGIKA TAMBAH KRU ---
  const handleAssignCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/crew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          freelancer_id: selectedCrew,
          assigned_role: assignedRole,
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        refreshEventData();
        setIsCrewModalOpen(false);
        setSelectedCrew("");
        setAssignedRole("");
      } else {
        alert("Gagal menugaskan kru: " + data.message);
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menugaskan kru");
    }
  };

  // --- 4. LOGIKA HAPUS KRU ---
  const handleRemoveCrew = async (assignmentId: string) => {
    if (!window.confirm("Yakin ingin menghapus kru ini dari tugas?")) return;

    try {
      const response = await fetch(`/api/crew`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId }),
      });

      const result = await response.json();

      if (result.status === "success") {
        setEventData((prevData: any) => ({
          ...prevData,
          crew: prevData.crew.filter(
            (c: any) => c.assignment_id !== assignmentId,
          ),
        }));
      } else {
        alert("Gagal menghapus kru: " + result.message);
      }
    } catch (error) {
      console.error("Error removing crew:", error);
      alert("Terjadi kesalahan sistem saat menghapus kru.");
    }
  };

  // --- 5. LOGIKA HAPUS EVENT ---
  const handleDeleteEvent = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      const json = await res.json();

      if (res.ok) {
        router.push("/admin/events");
      } else {
        alert(json.message || "Gagal menghapus event");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem saat menghapus event");
    }
  };

  const t = {
    id: {
      back: "Kembali ke List Event",
      title: "Detail Kendali Event",
      statusTitleSales: "Status Event",
      statusTitleManager: "Status Pelaksanaan",
      updateStatus: "Ubah Status",
      clientInfo: "Informasi Klien",
      eventInfo: "Spesifikasi Event",
      techInfo: "Kebutuhan Teknis & Paket",
      fields: {
        id: "ID Event",
        clientName: "Nama Klien",
        phone: "Nomor WhatsApp",
        eventName: "Nama / Agenda",
        date: "Tanggal Pelaksanaan",
        time: "Alokasi Waktu",
        location: "Lokasi Gedung",
        package: "Paket Utama",
        backdrop: "Tema Backdrop",
        frame: "Teks pada Frame",
        notes: "Catatan Lapangan",
        addons: "Tambahan",
      },
      editBtn: "Edit Data Event",
      deleteBtn: "Hapus",
      crewManagement: "Tim Kru Lapangan",
      crewSubtitle: "Kelola freelancer bertugas.",
      addCrewBtn: "Tambah",
      noCrew: "Belum ada kru ditugaskan.",
      modalTitle: "Tugaskan Kru Baru",
      modalSelect: "Pilih Freelancer",
      crewSelect: "--Pilih Kru--",
      modalRole: "Peran Lapangan",
      crewRole: "--Peran--",
      cancel: "Batal",
      save: "Simpan Penugasan",
      modalDelTitle: "Hapus Data Event",
      modalDelDesc:
        "Apakah Anda yakin ingin menghapus event ini? Semua jadwal dan penugasan kru akan hilang secara permanen.",
      confirmDel: "Ya, Hapus Event",
      valNoBackdrop: "Tanpa Backdrop (Disediakan Vendor Decor)",

      statusInquiry: "Inquiry",
      statusConfirmed: "Terkonfirmasi",
      statusDone: "Selesai",
      statusCancelled: "Dibatalkan",
      execUpcoming: "Akan Datang",
      execOngoing: "Berlangsung",
      execCompleted: "Selesai",
      execCanceled: "Dibatalkan",

      btnCancelEvent: "Batalkan Event",
      modalCancelTitle: "Batalkan Event",
      modalCancelDesc:
        "Apakah Anda yakin ingin membatalkan event ini? Aksi ini akan mengubah status operasional menjadi Dibatalkan.",
      confirmCancel: "Ya, Batalkan",
    },
    en: {
      back: "Back to Events",
      title: "Event Control Detail",
      statusTitleSales: "Event Status",
      statusTitleManager: "Execution Status",
      updateStatus: "Change Status",
      clientInfo: "Client Information",
      eventInfo: "Event Specifications",
      techInfo: "Technical & Package Needs",
      fields: {
        id: "Event ID",
        clientName: "Client Name",
        phone: "WhatsApp Number",
        eventName: "Event / Agenda",
        date: "Execution Date",
        time: "Time Allocation",
        location: "Building Location",
        package: "Main Package",
        backdrop: "Backdrop Theme",
        frame: "Text on Frame",
        notes: "Field Notes",
        addons: "Add-ons",
      },
      editBtn: "Edit Event Data",
      deleteBtn: "Delete",
      crewManagement: "Field Crew Team",
      crewSubtitle: "Manage assigned freelancers.",
      addCrewBtn: "Add",
      noCrew: "No crew assigned.",
      modalTitle: "Assign New Crew",
      modalSelect: "Select Freelancer",
      crewSelect: "--Select Crew--",
      modalRole: "Field Role",
      crewRole: "--Role--",
      cancel: "Cancel",
      save: "Save Assignment",
      modalDelTitle: "Delete Event Data",
      modalDelDesc:
        "Are you sure you want to delete this event? All schedules and crew assignments will be permanently lost.",
      confirmDel: "Yes, Delete Event",
      valNoBackdrop: "No Backdrop (Provided by Decor Vendor)",

      statusInquiry: "Inquiry",
      statusConfirmed: "Confirmed",
      statusDone: "Done",
      statusCancelled: "Cancelled",
      execUpcoming: "Upcoming",
      execOngoing: "Ongoing",
      execCompleted: "Completed",
      execCanceled: "Canceled",

      btnCancelEvent: "Cancel Event",
      modalCancelTitle: "Cancel Event",
      modalCancelDesc:
        "Are you sure you want to cancel this event? This action will change the operational status to Cancelled.",
      confirmCancel: "Yes, Cancel It",
    },
  }[lang === "id" ? "id" : "en"];

  // --- LOGIKA STYLING STATUS ---
  const getSalesStatusColor = (status: string) => {
    switch (status) {
      case "inquiry":
        return "bg-yellow-500 text-white shadow-lg shadow-yellow-500/20 border-transparent";
      case "confirmed":
        return "bg-blue-500 text-white shadow-lg shadow-blue-500/20 border-transparent";
      case "done":
        return "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-transparent";
      case "cancelled":
        return "bg-rose-500 text-white shadow-lg shadow-rose-500/20 border-transparent";
      default:
        return "bg-slate-200 dark:bg-slate-800 text-slate-500 border-transparent";
    }
  };

  const getSalesStatusText = (s: string) => {
    switch (s) {
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

  const getManagerStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-sky-500 text-white shadow-lg shadow-sky-500/20 border-transparent";
      case "ongoing":
        return "bg-violet-500 text-white shadow-lg shadow-violet-500/20 border-transparent";
      case "completed":
        return "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-transparent";
      case "canceled":
        return "bg-rose-500 text-white shadow-lg shadow-rose-500/20 border-transparent";
      default:
        return "bg-slate-200 dark:bg-slate-800 text-slate-500 border-transparent";
    }
  };

  const getManagerStatusText = (s: string) => {
    switch (s) {
      case "upcoming":
        return t.execUpcoming;
      case "ongoing":
        return t.execOngoing;
      case "completed":
        return t.execCompleted;
      case "canceled":
        return t.execCanceled;
      default:
        return s;
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  if (!eventData)
    return <div className="p-10 text-center">Event tidak ditemukan.</div>;

  const formatTitleCase = (str: string) => {
    if (!str || str === "-") return "-";
    return str
      .toLowerCase()
      .replace(/(?:^|[\s(])\w/g, (match) => match.toUpperCase());
  };

  const serviceItems =
    eventData.items?.filter((i: any) =>
      i.item_type?.toLowerCase().includes("service"),
    ) || [];

  const isEventManager = String(eventData.subRole)
    .toLowerCase()
    .includes("manager");

  const managerStatus = getEventChronologicalStatus(eventData);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white rounded-xl transition-all text-xs font-semibold shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
          <span>{t.back}</span>
        </Link>

        {/* Group Tombol Aksi */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => router.push(`/admin/events/${eventId}/edit`)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white transition-all shadow-sm active:scale-[0.98]"
          >
            <Edit className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
            <span>{t.editBtn}</span>
          </button>

          {!isEventManager && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-500 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all shadow-sm active:scale-[0.98]"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t.deleteBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Kolom Kiri & Tengah: Detail Konten */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Informasi Klien */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
              <User className="w-4 h-4" /> {t.clientInfo}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {t.fields.clientName}
                </p>
                <p className="text-base font-bold text-slate-800 dark:text-white mt-0.5">
                  {eventData.client_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {t.fields.phone}
                </p>
                <p className="text-base font-semibold text-primary dark:text-primary-light flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-4 h-4" /> {eventData.client_phone}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Spesifikasi Pelaksanaan */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors space-y-5">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {t.eventInfo}
            </h3>
            <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {t.fields.eventName}
              </p>
              <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
                {eventData.event_name}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-4">
              <div className="flex gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl h-fit">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {t.fields.date}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {new Date(eventData.event_date).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl h-fit">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {t.fields.time}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {eventData.event_time}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl h-fit">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {t.fields.location}
                </p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  {eventData.location}
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Spesifikasi Teknis Fotografi */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors space-y-4">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Package className="w-4 h-4" /> {t.techInfo}
            </h3>

            <div className="space-y-4">
              {serviceItems.length > 0 ? (
                serviceItems.map((svc: any, idx: number) => {
                  const itemBackdrop =
                    svc.backdrop ||
                    svc.backdrop_theme ||
                    eventData.backdrop ||
                    eventData.backdrop_theme ||
                    "-";
                  const itemNote =
                    svc.notes ||
                    svc.itemNotes ||
                    svc.note ||
                    eventData.notes ||
                    "Tidak ada catatan lapangan.";
                  const displayBackdrop = itemBackdrop
                    .toLowerCase()
                    .includes("tanpa backdrop")
                    ? t.valNoBackdrop
                    : formatTitleCase(itemBackdrop);

                  return (
                    <div
                      key={idx}
                      className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 space-y-3"
                    >
                      <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-2">
                        <p className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
                          <span className="text-primary">•</span>{" "}
                          {svc.item_name}
                        </p>
                        {svc.quantity > 1 && (
                          <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-lg border border-primary/20">
                            Qty: {svc.quantity}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-1">
                            <Layers className="w-3.5 h-3.5" />{" "}
                            {t.fields.backdrop}
                          </p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-snug">
                            {displayBackdrop}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-1">
                            <AlertCircle className="w-3.5 h-3.5" />{" "}
                            {t.fields.notes}
                          </p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 italic leading-snug">
                            {itemNote}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 text-center text-sm text-slate-500">
                  Tidak ada spesifikasi paket layanan yang ditemukan.
                </div>
              )}
            </div>

            {/* --- BAGIAN ADD-ONS --- */}
            {eventData.items &&
              eventData.items.filter((i: any) => i.item_type === "addon")
                .length > 0 && (
                <div className="pt-4 mt-4 border-t border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <PlusCircle className="w-3.5 h-3.5" /> {t.fields.addons}
                  </p>
                  <div className="space-y-2">
                    {eventData.items
                      .filter((i: any) => i.item_type === "addon")
                      .map((addon: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60"
                        >
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {addon.item_name}
                          </p>
                          <span className="text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2.5 py-1 rounded-lg">
                            Qty: {addon.quantity}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Kolom Kanan: Status & Manajemen Kru */}
        <div className="space-y-6">
          {/* Card: Status Control Panel DINAMIS BERDASARKAN ROLE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
              {isEventManager ? (
                <>
                  <CalendarClock className="w-4 h-4" /> {t.statusTitleManager}
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" /> {t.statusTitleSales}
                </>
              )}
            </h3>

            {/* Lencana Status Dinamis */}
            <div
              className={`w-full px-4 py-3 border rounded-xl text-center font-bold uppercase tracking-wider transition-colors duration-300 ${
                isEventManager
                  ? getManagerStatusColor(managerStatus)
                  : getSalesStatusColor(currentStatus)
              }`}
            >
              {isEventManager
                ? getManagerStatusText(managerStatus)
                : getSalesStatusText(currentStatus)}
            </div>

            {/* Tombol Batalkan Event (Sekarang Tersedia untuk Keduanya) */}
            {currentStatus !== "cancelled" && currentStatus !== "done" && (
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={isUpdating}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 rounded-xl text-sm font-bold transition-colors"
              >
                <XCircle className="w-4 h-4" /> {t.btnCancelEvent}
              </button>
            )}
          </div>

          {/* Card: Manajemen Tim Lapangan (HANYA MUNCUL UNTUK EVENT MANAGER) */}
          {isEventManager && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors space-y-4">
              <div className="flex justify-between items-center gap-3">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-primary" />{" "}
                    {t.crewManagement}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {t.crewSubtitle}
                  </p>
                </div>

                <div
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-black border flex items-center justify-center shrink-0 shadow-sm ${
                    eventData.crew.length >= eventData.maxCrew
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                      : "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20"
                  }`}
                >
                  {eventData.crew.length} / {eventData.maxCrew}
                </div>
              </div>

              {currentStatus !== "cancelled" &&
                (eventData.crew.length < eventData.maxCrew ? (
                  <button
                    onClick={() => setIsCrewModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-primary/10 border border-dashed border-slate-300 hover:border-primary text-slate-600 hover:text-primary dark:bg-slate-950 dark:border-slate-700 dark:hover:border-primary dark:text-slate-400 dark:hover:text-primary rounded-xl transition-all font-bold text-xs group"
                  >
                    <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{t.addCrewBtn} Kru Baru</span>
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Kuota Penuh
                    </span>
                  </div>
                ))}

              <div className="pt-2">
                <hr className="border-slate-100 dark:border-slate-800/60 mb-4" />
                <div className="space-y-3">
                  {eventData.crew && eventData.crew.length > 0 ? (
                    eventData.crew.map((c: any) => (
                      <div
                        key={c.freelancer_id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs shrink-0">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white">
                              {c.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <Shield className="w-3 h-3" /> {c.assigned_role}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleRemoveCrew(c.assignment_id || c.id)
                          }
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {t.noCrew}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500">
              {t.fields.id}: {eventData.id}
            </span>
          </div>
        </div>
      </div>

      {/* Modal Tambah Kru */}
      {isCrewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" /> {t.modalTitle}
              </h3>
              <button
                onClick={() => setIsCrewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAssignCrew}>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.modalSelect}
                    <span className="text-red-500"> * </span>
                  </label>
                  <select
                    required
                    value={selectedCrew}
                    onChange={(e) => setSelectedCrew(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-300"
                  >
                    <option value="">{t.crewSelect}</option>
                    {availableFreelancers
                      .filter(
                        (fl) =>
                          !eventData?.crew?.some(
                            (assigned: any) => assigned.freelancer_id === fl.id,
                          ),
                      )
                      .map((fl) => (
                        <option key={fl.id} value={fl.id}>
                          {fl.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.modalRole}
                    <span className="text-red-500"> * </span>
                  </label>
                  <select
                    required
                    value={assignedRole}
                    onChange={(e) => setAssignedRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-300"
                  >
                    <option value="">{t.crewRole}</option>
                    <option value="Photographer">Photographer</option>
                    <option value="Operator">Operator</option>
                    <option value="Usher">Usher</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCrewModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-primary text-white hover:bg-primary-hover rounded-xl transition-colors"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI BATALKAN EVENT */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">
                {t.modalCancelTitle}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.modalCancelDesc}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => handleStatusChange("cancelled")}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm shadow-rose-600/20"
              >
                {t.confirmCancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS EVENT */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">
                {t.modalDelTitle}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.modalDelDesc}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleDeleteEvent}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm shadow-rose-600/20"
              >
                {t.confirmDel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

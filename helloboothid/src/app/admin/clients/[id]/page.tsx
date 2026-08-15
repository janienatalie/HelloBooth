// src/app/admin/clients/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Clock,
  Package,
  History,
  Trash2,
  AlertTriangle,
  X,
  Save,
} from "lucide-react";
import { useLanguage } from "@/providers/AppProvider";
import { clientService } from "@/app/services/clientService";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const clientId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState<any>(null);
  const [clientEvents, setClientEvents] = useState([]);

  // --- STATE USER AUTH ---
  const [user, setUser] = useState({ subRole: "", username: "" });

  // State untuk Modal Hapus
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // --- STATE UNTUK MODAL EDIT ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Ambil Data Identitas User
  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        if (json.status === "success") {
          setUser({
            subRole: json.data?.sub_role || json.data?.role || "",
            username: json.data?.username || "",
          });
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
    }
  };

  // Ambil Data dari Backend
  const fetchClientDetail = async () => {
    try {
      const data = await clientService.getClientById(clientId);

      const clientObj = data.client || data;
      setClientData(clientObj);
      setClientEvents(clientObj.events || []);

      setEditForm({
        name: clientObj.name,
        email: clientObj.email,
        phone: clientObj.phone,
      });
    } catch (error) {
      console.error("Gagal mengambil detail klien:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    if (clientId) fetchClientDetail();
  }, [clientId]);

  // Fungsi Simpan Perubahan (Update)
  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const allClients = await clientService.getClients();

      const duplicateEmail = allClients.find(
        (c: any) =>
          c.email.toLowerCase() === editForm.email.toLowerCase() &&
          c.id !== clientId,
      );

      const duplicatePhone = allClients.find(
        (c: any) => c.phone === editForm.phone && c.id !== clientId,
      );

      if (duplicateEmail) {
        alert(`Email "${editForm.email}" sudah digunakan oleh klien lain.`);
        return;
      }

      if (duplicatePhone) {
        alert(
          `Nomor WhatsApp "${editForm.phone}" sudah digunakan oleh klien lain.`,
        );
        return;
      }

      setIsSaving(true);
      const result = await clientService.updateClient(clientId, editForm);

      if (result.status === "success") {
        await fetchClientDetail();
        setShowEditModal(false);
      }
    } catch (error: any) {
      alert(error.message || "Gagal memperbarui data klien.");
    } finally {
      setIsSaving(false);
    }
  };

  // Fungsi Hapus
  const handleDeleteClient = async () => {
    try {
      await clientService.deleteClient(clientId);
      setShowDeleteModal(false);
      router.push("/admin/clients");
      alert("Data klien telah dihapus.");
    } catch (error: any) {
      alert(error.message || "Gagal menghapus klien.");
    }
  };

  const t = {
    id: {
      back: "Kembali ke List Klien",
      title: "Detail Profil Klien",
      editBtn: "Edit Data",
      deleteBtn: "Hapus",
      profileInfo: "Profil Klien",
      contactInfo: "Informasi Kontak",
      eventHistory: "Riwayat Event Klien",
      fields: {
        name: "Nama Lengkap",
        email: "Alamat Email",
        phone: "Nomor WhatsApp",
      },
      noHistory: "Belum ada riwayat event untuk klien ini.",
      modalEditTitle: "Edit Profil Klien",
      modalDelTitle: "Hapus Data Klien",
      modalDelDesc:
        "Apakah Anda yakin ingin menghapus klien ini? Semua data riwayat akan hilang permanen.",
      cancel: "Batal",
      confirmDel: "Ya, Hapus",
      save: "Simpan Perubahan",
    },
    en: {
      back: "Back to Clients",
      title: "Client Profile Detail",
      editBtn: "Edit Data",
      deleteBtn: "Delete",
      profileInfo: "Client Profile",
      contactInfo: "Contact Information",
      eventHistory: "Client Event History",
      fields: {
        name: "Full Name",
        email: "Email Address",
        phone: "WhatsApp Number",
      },
      noHistory: "No event history for this client yet.",
      modalEditTitle: "Edit Client Profile",
      modalDelTitle: "Delete Client Data",
      modalDelDesc:
        "Are you sure you want to delete this client? All history data will be lost forever.",
      cancel: "Cancel",
      confirmDel: "Yes, Delete",
      save: "Save Changes",
    },
  }[lang];

  if (loading)
    return (
      <div className="p-12 text-center text-slate-500">
        Memuat detail klien...
      </div>
    );
  if (!clientData)
    return (
      <div className="p-12 text-center text-slate-500">
        Data tidak ditemukan.
      </div>
    );

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const locale = lang === "id" ? "id-ID" : "en-US";
    return new Date(dateString).toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "selesai":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400";
      case "deal":
      case "dp":
        return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";
      case "batal":
        return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400";
      default:
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
    }
  };

  // --- LOGIKA ROLE ---
  const safeRole = String(user.subRole).toLowerCase();
  const isSalesUser =
    safeRole.includes("sales") ||
    safeRole.includes("b2b") ||
    safeRole.includes("b2c");

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-xs font-semibold shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
          <span>{t.back}</span>
        </Link>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-all shadow-sm"
          >
            <Edit className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
            <span>{t.editBtn}</span>
          </button>

          {/* HANYA MUNCUL JIKA USER ADALAH SALES */}
          {isSalesUser && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-rose-200 text-rose-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-rose-50 transition-all shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.deleteBtn}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-6">
              <User className="w-4 h-4" /> {t.profileInfo}
            </h3>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-3xl mb-3 shadow-sm border-4 border-white dark:border-slate-900">
                {clientData.name?.charAt(0)}
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">
                {clientData.name}
              </h2>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Phone className="w-4 h-4" /> {t.contactInfo}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400">{t.fields.phone}</p>
                <p className="text-sm font-semibold text-primary flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5" /> {clientData.phone}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{t.fields.email}</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5" /> {clientData.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[300px]">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-6">
              <History className="w-4 h-4 text-primary" /> {t.eventHistory}
            </h3>

            {clientEvents && clientEvents.length > 0 ? (
              <div className="space-y-4">
                {clientEvents.map((evt: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => router.push(`/admin/events/${evt.id}`)}
                    className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors">
                        {evt.event_name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />{" "}
                          {formatDate(evt.event_date)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${getStatusStyle(evt.status)}`}
                    >
                      {evt.status || "Inquiry"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 italic text-sm space-y-3">
                <Package className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                <p>{t.noHistory}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL EDIT DATA (POP-UP) --- */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-sm">
                {t.modalEditTitle}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleUpdateClient}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    {t.fields.name}
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none dark:text-white transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    {t.fields.email}
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none dark:text-white transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    {t.fields.phone}
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none dark:text-white transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-xl text-sm font-black hover:bg-primary-hover shadow-lg shadow-primary/25 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "..." : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">
                {t.modalDelTitle}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.modalDelDesc}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleDeleteClient}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
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

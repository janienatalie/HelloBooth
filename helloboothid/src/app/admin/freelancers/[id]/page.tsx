"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Clock,
  Briefcase,
  Trash2,
  AlertTriangle,
  Shield,
  Loader2,
  X,
} from "lucide-react";
import { useLanguage } from "@/providers/AppProvider";

export default function FreelancerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const freelancerId = params?.id as string;

  const [freelancer, setFreelancer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // State untuk Modal Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    status: "",
  });

  useEffect(() => {
    const fetchDetail = async () => {
      if (!freelancerId) return;
      try {
        setLoading(true);
        const res = await fetch(
          `/api/freelancers/${freelancerId}?t=${Date.now()}`,
        );
        const json = await res.json();
        if (json.status === "success") {
          setFreelancer(json.data);
          // Isi data awal form edit
          setEditForm({
            name: json.data.name,
            role: json.data.role,
            email: json.data.email,
            phone: json.data.phone,
            status: json.data.status || "Active",
          });
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [freelancerId]);

  // FUNGSI DELETE
  const handleDeleteFreelancer = async () => {
    try {
      const res = await fetch(`/api/freelancers/${freelancerId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.status === "success") {
        router.push("/admin/freelancers");
      } else {
        alert(json.message);
      }
    } catch (error) {
      alert("Gagal menghapus data");
    }
  };

  // FUNGSI EDIT (UPDATE)
  const handleUpdateFreelancer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/freelancers/${freelancerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (json.status === "success") {
        setFreelancer({ ...freelancer, ...editForm });
        setShowEditModal(false);
      } else {
        alert(json.message);
      }
    } catch (error) {
      alert("Gagal memperbarui data");
    }
  };

  const t = {
    id: {
      back: "Kembali ke List Kru",
      title: "Detail Profil Kru",
      editBtn: "Edit Data",
      deleteBtn: "Hapus",
      profileInfo: "Profil & Keahlian",
      contactInfo: "Informasi Kontak",
      jobHistory: "Riwayat Penugasan",
      fields: {
        name: "Nama Lengkap",
        role: "Keahlian Utama",
        email: "Alamat Email",
        phone: "Nomor WhatsApp",
        status: "Status Kontrak",
        joinDate: "Tanggal Bergabung",
      },
      modalDelTitle: "Hapus Freelancer?",
      modalDelDesc:
        "Tindakan ini permanen. Seluruh data profil dan riwayat kru ini akan dihapus dari sistem.",
      cancel: "Batal",
      confirm: "Ya, Hapus",
      save: "Simpan Perubahan",
    },
    en: {
      back: "Back to Crew List",
      title: "Crew Profile Detail",
      editBtn: "Edit Data",
      deleteBtn: "Delete",
      profileInfo: "Profile & Skills",
      contactInfo: "Contact Information",
      jobHistory: "Job History",
      fields: {
        name: "Full Name",
        role: "Main Skill",
        email: "Email Address",
        phone: "WhatsApp Number",
        status: "Contract Status",
        joinDate: "Join Date",
      },
      modalDelTitle: "Delete Freelancer?",
      modalDelDesc:
        "This action is permanent. All profile and history data will be removed.",
      cancel: "Cancel",
      confirm: "Yes, Delete",
      save: "Save Changes",
    },
  };

  const currentT = lang === "id" ? t.id : t.en;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-500 font-medium italic">
          Memuat profil kru...
        </p>
      </div>
    );
  }

  if (!freelancer) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/freelancers"
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
              {currentT.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              ID: <span className="font-mono">{freelancer.id}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit className="w-4 h-4" /> {currentT.editBtn}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-sm font-bold hover:bg-rose-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> {currentT.deleteBtn}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> {currentT.profileInfo}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {currentT.fields.name}
                </p>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-bold">
                  <User className="w-4 h-4 text-primary" /> {freelancer.name}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {currentT.fields.role}
                </p>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-bold">
                  <Briefcase className="w-4 h-4 text-blue-500" />{" "}
                  {freelancer.role}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {currentT.fields.status}
                </p>
                <span
                  className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${
                    freelancer.status === "Inactive"
                      ? "bg-rose-50 text-rose-600 border-rose-100" // Merah jika Inactive
                      : "bg-green-50 text-green-600 border-green-100" // Hijau jika Active
                  }`}
                >
                  {freelancer.status || "Active"}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {currentT.fields.joinDate}
                </p>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-bold">
                  <Clock className="w-4 h-4 text-orange-500" />{" "}
                  {new Date(freelancer.created_at).toLocaleDateString(
                    lang === "id" ? "id-ID" : "en-US",
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Riwayat Penugasan */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />{" "}
              {currentT.jobHistory}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 uppercase tracking-widest">
                    <th className="pb-4 px-4 font-black">Event</th>
                    <th className="pb-4 px-4 font-black">Role</th>
                    <th className="pb-4 px-4 font-black">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {freelancer.history?.length > 0 ? (
                    freelancer.history.map((job: any, index: number) => (
                      <tr key={index}>
                        <td className="py-4 px-4 font-bold text-slate-800 dark:text-white text-sm">
                          {job.event_name}
                        </td>
                        <td className="py-4 px-4 text-slate-500 text-sm">
                          {job.assigned_role}
                        </td>
                        <td className="py-4 px-4 text-slate-400 text-sm italic">
                          {new Date(job.event_date).toLocaleDateString(
                            lang === "id" ? "id-ID" : "en-US",
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-10 text-center text-slate-400 text-sm italic"
                      >
                        Belum ada riwayat penugasan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Kontak */}
        <div className="space-y-6">
          <div className="bg-primary dark:bg-primary rounded-3xl p-8 text-white shadow-xl">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-100" /> {currentT.contactInfo}
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <Phone className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-0.5">
                    {currentT.fields.phone}
                  </p>
                  <p className="text-sm font-bold text-white/90">
                    {freelancer.phone || "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <Mail className="w-4 h-4 text-blue-100" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-0.5">
                    {currentT.fields.email}
                  </p>
                  <p className="text-sm font-bold text-white/90">
                    {freelancer.email || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* POP UP EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          ></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800 dark:text-white">
                Edit Profil Kru
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateFreelancer} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Keahlian Utama
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
                    required
                  >
                    <option value="">Pilih Keahlian</option>
                    <option value="Photographer">Photographer</option>
                    <option value="Operator">Operator</option>
                    <option value="Usher">Usher</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">
                  WhatsApp
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-2xl transition-colors"
                >
                  {currentT.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-hover rounded-2xl transition-colors shadow-lg shadow-primary/20"
                >
                  {currentT.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL (Asli dari UI kamu) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          ></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">
                {currentT.modalDelTitle}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {currentT.modalDelDesc}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
              >
                {currentT.cancel}
              </button>
              <button
                onClick={handleDeleteFreelancer}
                className="flex-1 py-3 text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-2xl transition-colors shadow-lg shadow-rose-600/20"
              >
                {currentT.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

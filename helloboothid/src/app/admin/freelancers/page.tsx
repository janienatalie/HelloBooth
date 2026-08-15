// src/app/admin/freelancers/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Phone,
  Camera,
  ChevronRight,
  X,
  KeyRound,
} from "lucide-react";
import { useLanguage } from "@/providers/AppProvider";
import { freelancerService } from "@/app/services/freelancerService";

export default function FreelancersPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("Semua");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- PERBAIKAN: Mengganti user_id menjadi username & password ---
  const [newFreelancer, setNewFreelancer] = useState({
    name: "",
    role: "",
    phone: "",
    email: "",
    username: "",
    password: "",
  });

  const t = {
    id: {
      title: "Manajemen Freelancer",
      subtitle:
        "Kelola basis data kru lapangan, keahlian teknis, dan status penugasan.",
      searchPlaceholder: "Cari nama atau nomor telepon...",
      addFreelancer: "Tambah Freelancer",
      roles: ["Semua", "Photographer", "Operator", "Usher"],
      formRoles: ["Photographer", "Operator", "Usher"],
      colName: "Nama Lengkap / Peran",
      colContact: "Kontak WhatsApp",
      colStatus: "Status Kerja",
      colAction: "Aksi",
      statusAvailable: "Tersedia",
      statusOnEvent: "Sedang Bertugas",
      noData: "Tidak ada data freelancer yang ditemukan.",
      viewDetail: "Detail Profil",
      modalTitle: "Tambah Freelancer Baru",
      modalName: "Nama Lengkap",
      modalRole: "Peran Utama / Keahlian",
      modalPhone: "Nomor WhatsApp",
      modalEmail: "Alamat Email",
      loginSection: "Buat Akun Login Kru",
      cancel: "Batal",
      save: "Simpan Anggota Kru",
    },
    en: {
      title: "Freelancer Management",
      subtitle:
        "Manage field crew database, technical skills, and assignment status.",
      searchPlaceholder: "Search name or phone number...",
      addFreelancer: "Add Freelancer",
      roles: ["All", "Photographer", "Operator", "Usher"],
      formRoles: ["Photographer", "Operator", "Usher"],
      colName: "Full Name / Role",
      colContact: "WhatsApp Contact",
      colStatus: "Work Status",
      colAction: "Action",
      noData: "No freelancer data found.",
      viewDetail: "View Profile",
      modalTitle: "Add New Freelancer",
      modalName: "Full Name",
      modalRole: "Primary Role / Skill",
      modalPhone: "WhatsApp Number",
      modalEmail: "Email Address",
      loginSection: "Create Crew Login Account",
      cancel: "Cancel",
      save: "Save Crew Member",
    },
  }[lang === "id" ? "id" : "en"];

  const loadFreelancers = async () => {
    setLoading(true);
    try {
      const res = await freelancerService.getFreelancers();
      if (res.status === "success") {
        setFreelancers(res.data);
      }
    } catch (error) {
      console.error("Gagal memuat freelancer:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFreelancers();
  }, []);

  const handleSaveFreelancer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await freelancerService.createFreelancer(newFreelancer);

      if (res.status === "success") {
        alert(
          lang === "id"
            ? "Freelancer beserta akun login berhasil dibuat!"
            : "Freelancer and login account created successfully!",
        );
        setIsModalOpen(false);
        setNewFreelancer({
          name: "",
          role: "",
          phone: "",
          email: "",
          username: "",
          password: "",
        });
        loadFreelancers();
      } else {
        alert("Gagal menambahkan: " + res.message);
      }
    } catch (error: any) {
      alert("Gagal menyimpan data: " + error.message);
    }
  };

  const filteredFreelancers = freelancers.filter((fl) => {
    const matchSearch =
      fl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fl.phone && fl.phone.includes(searchQuery));
    const isAll = selectedRole === "Semua" || selectedRole === "All";
    const matchRole = isAll || fl.role === selectedRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {t.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.subtitle}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors font-medium shadow-sm shadow-primary/20 w-full sm:w-auto justify-center active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          <span>{t.addFreelancer}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-colors flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Camera className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full md:w-48 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-300 transition-colors"
          >
            {t.roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-colors"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {t.colName}
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {t.colContact}
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {t.colStatus}
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400 text-right">
                  {t.colAction}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredFreelancers.length > 0 ? (
                filteredFreelancers.map((fl) => {
                  const isActive =
                    fl.status === "Active" || fl.status === "active";

                  return (
                    <tr
                      key={fl.id}
                      className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all bg-transparent"
                    >
                      <td
                        onClick={() =>
                          router.push(`/admin/freelancers/${fl.id}`)
                        }
                        style={{ cursor: "pointer" }}
                        className="py-4 px-6 select-none"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-light dark:bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {fl.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">
                              {fl.name}
                            </p>
                            <span className="inline-block text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md mt-0.5">
                              {fl.role}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td
                        onClick={() =>
                          router.push(`/admin/freelancers/${fl.id}`)
                        }
                        style={{ cursor: "pointer" }}
                        className="py-4 px-6 select-none"
                      >
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />{" "}
                          {fl.phone || "-"}
                        </p>
                      </td>

                      <td
                        onClick={() =>
                          router.push(`/admin/freelancers/${fl.id}`)
                        }
                        style={{ cursor: "pointer" }}
                        className="py-4 px-6 select-none"
                      >
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                              : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {fl.status || "Active"}
                        </span>
                      </td>

                      <td
                        onClick={() =>
                          router.push(`/admin/freelancers/${fl.id}`)
                        }
                        style={{ cursor: "pointer" }}
                        className="py-4 px-6 text-right select-none"
                      >
                        <button className="inline-flex items-center gap-1 text-primary hover:text-primary-hover font-semibold text-sm transition-colors">
                          <span>{t.viewDetail}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    <p className="font-medium">{t.noData}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {t.modalTitle}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFreelancer}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t.modalName}{" "}
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newFreelancer.name}
                    onChange={(e) =>
                      setNewFreelancer({
                        ...newFreelancer,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                    placeholder="e.g. Ahmad Fauzi"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t.modalRole}{" "}
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <select
                    required
                    value={newFreelancer.role}
                    onChange={(e) =>
                      setNewFreelancer({
                        ...newFreelancer,
                        role: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-300"
                  >
                    <option value="">-- Pilih Peran Kerja --</option>
                    {t.formRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t.modalPhone}{" "}
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={newFreelancer.phone}
                    onChange={(e) =>
                      setNewFreelancer({
                        ...newFreelancer,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                    placeholder="0812XXXXXXXX"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t.modalEmail} (Opsional)
                  </label>
                  <input
                    type="email"
                    value={newFreelancer.email}
                    onChange={(e) =>
                      setNewFreelancer({
                        ...newFreelancer,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                    placeholder="kru@email.com"
                  />
                </div>

                {/* --- SEKSI PEMBUATAN AKUN LOGIN (BARU) --- */}
                <div className="space-y-3 bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-1.5 text-primary dark:text-primary-light">
                    <KeyRound className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {t.loginSection}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Username <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newFreelancer.username}
                      onChange={(e) =>
                        setNewFreelancer({
                          ...newFreelancer,
                          // Regex otomatis membuang spasi & memaksa huruf kecil
                          username: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, ""),
                        })
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                      placeholder="fauzi_usher"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text" // Sengaja dibuat type text agar admin bisa menyalin/melihat kodenya
                      required
                      value={newFreelancer.password}
                      onChange={(e) =>
                        setNewFreelancer({
                          ...newFreelancer,
                          password: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none font-mono"
                      placeholder="hellobooth123"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold bg-primary text-white hover:bg-primary-hover rounded-xl shadow-sm shadow-primary/30 transition-colors"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

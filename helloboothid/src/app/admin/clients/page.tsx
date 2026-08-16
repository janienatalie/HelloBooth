// src/app/admin/clients/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { useLanguage } from "@/providers/AppProvider";

export default function ClientsPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);

  // --- STATE USER AUTH ---
  const [user, setUser] = useState({ subRole: "", username: "" });

  // --- STATE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // --- STATE VALIDASI REAL-TIME ---
  const [errors, setErrors] = useState({
    phone: "",
    email: "",
  });

  // Fetch identitas user yang sedang login
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

  // UBAHAN: Langsung fetch ke endpoint Next.js baru
  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clients", { cache: "no-store" });
      const json = await res.json();
      if (json.status === "success") {
        setClients(json.data.clients || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data klien:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchClients();
  }, []);

  // Reset ke halaman 1 jika pencarian atau jumlah data per halaman diubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const t =
    lang === "id"
      ? {
          title: "Manajemen Klien",
          searchPlaceholder: "Cari nama atau no. HP...",
          addClient: "Tambah Klien",
          name: "Nama Klien",
          contact: "Kontak",
          events: "Total Event",
          action: "Aksi",
          noData: "Tidak ada klien ditemukan.",
          modalTitle: "Tambah Klien Baru",
          modalName: "Nama Lengkap",
          modalPhone: "Nomor WhatsApp",
          modalEmail: "Alamat Email",
          modalAddress: "Alamat Lengkap",
          cancel: "Batal",
          save: "Simpan Klien",
          rowsPerPage: "Data per halaman",
          showing: "Menampilkan",
          to: "hingga",
          of: "dari",
          entries: "entri",
          prev: "Sebelumnya",
          next: "Berikutnya",
          totalRegistered: "Total Klien Terdaftar",
          loadingData: "Memuat data...",
          exampleName: "Contoh: Janie Natalie",
          phoneError: "Gunakan angka, min 9 karakter.",
          emailError: "Format email tidak valid.",
        }
      : {
          title: "Client Management",
          searchPlaceholder: "Search name or phone...",
          addClient: "Add Client",
          name: "Client Name",
          contact: "Contact",
          events: "Total Events",
          action: "Action",
          noData: "No clients found.",
          modalTitle: "Add New Client",
          modalName: "Full Name",
          modalPhone: "WhatsApp Number",
          modalEmail: "Email Address",
          modalAddress: "Full Address",
          cancel: "Cancel",
          save: "Save Client",
          rowsPerPage: "Rows per page",
          showing: "Showing",
          to: "to",
          of: "of",
          entries: "entries",
          prev: "Previous",
          next: "Next",
          totalRegistered: "Total Registered Clients",
          loadingData: "Loading data...",
          exampleName: "Example: Janie Natalie",
          phoneError: "Use numbers, min 9 chars.",
          emailError: "Invalid email format.",
        };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Blokir submit jika masih ada error format
    if (errors.phone || errors.email) {
      alert(
        lang === "id"
          ? "Pastikan format email dan nomor telepon sudah benar sebelum menyimpan."
          : "Please ensure email and phone formats are correct before saving.",
      );
      return;
    }

    // 2. Cek Duplikasi (Email & Phone)
    const duplicateEmail = clients.find(
      (c: any) => c.email.toLowerCase() === newClient.email.toLowerCase(),
    );
    const duplicatePhone = clients.find(
      (c: any) => c.phone === newClient.phone,
    );

    if (duplicateEmail) {
      alert(
        lang === "id"
          ? `Email "${newClient.email}" sudah terdaftar. Gunakan email lain.`
          : `Email "${newClient.email}" is already registered. Please use another one.`,
      );
      return;
    }

    if (duplicatePhone) {
      alert(
        lang === "id"
          ? `Nomor Telepon "${newClient.phone}" sudah terdaftar. Gunakan nomor lain.`
          : `Phone Number "${newClient.phone}" is already registered. Please use another one.`,
      );
      return;
    }

    // UBAHAN: Langsung POST ke endpoint Next.js baru
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newClient.name,
          email: newClient.email,
          phone: newClient.phone,
        }),
      });

      const result = await res.json();

      if (result.status === "success") {
        closeModal();
        fetchClients();
      } else {
        alert(
          result.message ||
            (lang === "id"
              ? "Gagal menambahkan klien."
              : "Failed to add client."),
        );
      }
    } catch (error: any) {
      alert(
        lang === "id"
          ? "Terjadi kesalahan jaringan."
          : "Network error occurred.",
      );
    }
  };

  // Fungsi untuk menutup modal dan mereset form & error
  const closeModal = () => {
    setIsModalOpen(false);
    setNewClient({ name: "", phone: "", email: "" });
    setErrors({ phone: "", email: "" });
  };

  const filteredClients = clients.filter(
    (c: any) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery),
  );

  // --- KALKULASI PAGINATION ---
  const totalItems = filteredClients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filteredClients.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // --- LOGIKA ROLE ---
  const isSalesUser = String(user.subRole).toLowerCase().includes("sales");

  return (
    <div className="p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {clients.length} {t.totalRegistered}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm w-full sm:w-64 text-slate-900 dark:text-white"
            />
          </div>

          {/* TOMBOL HANYA MUNCUL UNTUK SALES */}
          {isSalesUser && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              {t.addClient}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.name}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.contact}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                  {t.events}
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.action}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-slate-400"
                  >
                    {t.loadingData}
                  </td>
                </tr>
              ) : paginatedClients.length > 0 ? (
                paginatedClients.map((client: any) => (
                  <tr
                    key={client.id}
                    onClick={() => router.push(`/admin/clients/${client.id}`)}
                    className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        {client.name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {client.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {client.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-full">
                        {client.total_events || 0} Event
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center justify-center p-2 text-slate-400 group-hover:text-primary transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic"
                  >
                    {t.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- KONTROL PAGINATION --- */}
        {!loading && totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>{t.rowsPerPage}:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-primary/50"
              >
                {[5, 10, 25, 50].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.showing} {startIndex + 1} {t.to}{" "}
              {Math.min(startIndex + itemsPerPage, totalItems)} {t.of}{" "}
              {totalItems} {t.entries}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                title={t.prev}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold px-2 text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages || 1}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                title={t.next}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL TAMBAH KLIEN --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                {t.modalTitle}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {t.modalName}
                  </label>
                  <input
                    type="text"
                    required
                    value={newClient.name}
                    onChange={(e) =>
                      setNewClient({ ...newClient, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                    placeholder={t.exampleName}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      {t.modalPhone}
                    </label>
                    <input
                      type="text"
                      required
                      value={newClient.phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewClient({ ...newClient, phone: val });

                        // Validasi Telepon: Hanya angka/+, min 9 digit, max 15 digit
                        const phoneRegex = /^[0-9+]{9,15}$/;
                        if (val && !phoneRegex.test(val)) {
                          setErrors({
                            ...errors,
                            phone: t.phoneError,
                          });
                        } else {
                          setErrors({ ...errors, phone: "" });
                        }
                      }}
                      className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg text-sm focus:outline-none focus:ring-2 dark:text-white ${
                        errors.phone
                          ? "border-rose-500 focus:ring-rose-500/50"
                          : "border-slate-200 dark:border-slate-800 focus:ring-primary/50"
                      }`}
                      placeholder="0812..."
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-rose-500 mt-1 font-medium">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      {t.modalEmail}
                    </label>
                    <input
                      type="email"
                      required
                      value={newClient.email}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewClient({ ...newClient, email: val });

                        // Validasi Email standar
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (val && !emailRegex.test(val)) {
                          setErrors({
                            ...errors,
                            email: t.emailError,
                          });
                        } else {
                          setErrors({ ...errors, email: "" });
                        }
                      }}
                      className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg text-sm focus:outline-none focus:ring-2 dark:text-white ${
                        errors.email
                          ? "border-rose-500 focus:ring-rose-500/50"
                          : "border-slate-200 dark:border-slate-800 focus:ring-primary/50"
                      }`}
                      placeholder="janie@example.com"
                    />
                    {errors.email && (
                      <p className="text-[11px] text-rose-500 mt-1 font-medium">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={!!(errors.phone || errors.email)}
                  className="px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary-hover rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

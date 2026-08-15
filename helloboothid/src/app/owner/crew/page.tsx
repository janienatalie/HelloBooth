// src/app/owner/crew/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/providers/AppProvider";

interface CrewData {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: string;
}

export default function OwnerCrewPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [crewList, setCrewList] = useState<CrewData[]>([]);
  const [filteredCrew, setFilteredCrew] = useState<CrewData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchCrew = async () => {
      try {
        const res = await fetch("/api/owner/crew", { cache: "no-store" });

        if (!res.ok) {
          throw new Error(`API bermasalah! Status: ${res.status}`);
        }

        const json = await res.json();
        if (json.status === "success") {
          setCrewList(json.data);
          setFilteredCrew(json.data);
        }
      } catch (error) {
        console.error("Gagal memuat data direktori kru:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrew();
  }, []);

  // Filter pencarian berdasarkan nama atau posisi/role
  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = crewList.filter(
      (crew) =>
        crew.name.toLowerCase().includes(lowerQuery) ||
        (crew.role && crew.role.toLowerCase().includes(lowerQuery)) ||
        (crew.phone && crew.phone.includes(lowerQuery)),
    );
    setFilteredCrew(filtered);
    // Reset ke halaman 1 setiap kali pencarian berubah
    setCurrentPage(1);
  }, [searchQuery, crewList]);

  // Reset pagination jika pilihan jumlah item per halaman berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const t = {
    id: {
      title: "Direktori Freelancer",
      subtitle:
        "Pantau daftar lengkap freelancer, posisi tugas, dan informasi kontak mereka.",
      searchPlaceholder: "Cari nama, posisi, atau no HP...",
      colName: "Nama Freelancer",
      colRole: "Posisi / Tugas",
      colContact: "Kontak",
      colStatus: "Status",
      loading: "Memuat direktori freelancer...",
      noData: "Tidak ada data freelancer yang ditemukan.",
      statusActive: "Aktif",
      statusInactive: "Tidak Aktif",
      rowsPerPage: "Data per halaman",
      showing: "Menampilkan",
      to: "hingga",
      of: "dari",
      entries: "entri",
      prev: "Sebelumnya",
      next: "Berikutnya",
    },
    en: {
      title: "Freelancer Directory",
      subtitle:
        "Monitor the complete list of freelancers, their roles, and contact information.",
      searchPlaceholder: "Search name, role, or phone...",
      colName: "Freelancer Name",
      colRole: "Role / Position",
      colContact: "Contact",
      colStatus: "Status",
      loading: "Loading freelancer directory...",
      noData: "No freelancer data found.",
      statusActive: "Active",
      statusInactive: "Inactive",
      rowsPerPage: "Rows per page",
      showing: "Showing",
      to: "to",
      of: "of",
      entries: "entries",
      prev: "Previous",
      next: "Next",
    },
  }[lang === "id" ? "id" : "en"];

  const getStatusClass = (status: string) => {
    if (
      status?.toLowerCase() === "active" ||
      status?.toLowerCase() === "aktif"
    ) {
      return "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
    }
    return "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
  };

  // --- KALKULASI PAGINATION ---
  const totalItems = filteredCrew.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCrew = filteredCrew.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium text-sm">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* HEADER UTAMA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> {t.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* FILTER PENCARIAN */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 max-w-md shadow-sm transition-colors">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />

        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm bg-transparent outline-none border-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
        />
      </div>

      {/* TABEL DATA KRU */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.colName}
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.colRole}
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.colContact}
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  {t.colStatus}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedCrew.length > 0 ? (
                paginatedCrew.map((crew) => (
                  <tr
                    key={crew.id}
                    onClick={() => router.push(`/owner/crew/${crew.id}`)}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer group"
                  >
                    {/* Kolom Nama & Inisial */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">
                          {crew.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm capitalize group-hover:text-primary transition-colors">
                          {crew.name}
                        </p>
                      </div>
                    </td>

                    {/* Kolom Role/Posisi */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                        {crew.role || "Freelancer"}
                      </span>
                    </td>

                    {/* Kolom Kontak (Phone & Email) */}
                    <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex flex-col gap-1.5">
                        <p className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />{" "}
                          {crew.phone || "-"}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />{" "}
                          {crew.email || "-"}
                        </p>
                      </div>
                    </td>

                    {/* Kolom Status Aktif/Inaktif */}
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusClass(crew.status)}`}
                      >
                        {crew.status?.toLowerCase() === "active" ||
                        crew.status?.toLowerCase() === "aktif" ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t.statusActive}
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            {t.statusInactive}
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-slate-400 text-sm italic"
                  >
                    {t.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- KONTROL PAGINATION --- */}
        {!isLoading && totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 gap-4">
            {/* Opsi Rows per page */}
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

            {/* Info Status Item */}
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.showing} {startIndex + 1} {t.to}{" "}
              {Math.min(startIndex + itemsPerPage, totalItems)} {t.of}{" "}
              {totalItems} {t.entries}
            </div>

            {/* Navigasi Prev/Next */}
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
    </div>
  );
}

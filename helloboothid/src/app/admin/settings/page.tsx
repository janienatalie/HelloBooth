// src/app/admin/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Package,
  Layers,
  Edit3,
  Search,
  X,
  Save,
  DollarSign,
  ArrowUpDown,
} from "lucide-react";
import { useLanguage } from "@/providers/AppProvider";

interface MasterDataItem {
  id: string;
  name: string;
  price?: number | string;
  base_price?: number | string;
  price_b2b?: number | string;
  price_b2c?: number | string;
}

export default function MasterDataPage() {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState("packages");
  const [searchQuery, setSearchQuery] = useState("");

  // ================= STATE SORTING =================
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>({
    key: "price_b2b",
    direction: "asc",
  });

  // ================= STATE DATA =================
  const [packagesData, setPackagesData] = useState<MasterDataItem[]>([]);
  const [addonsData, setAddonsData] = useState<MasterDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  // --- STATE USER AUTH ---
  const [userRole, setUserRole] = useState("");

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        if (json.status === "success") {
          setUserRole(json.data?.sub_role || json.data?.role || "");
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
    }
  };

  const refreshData = async () => {
    setLoading(true);

    try {
      // Fetch Packages and Addons from Next.js API Routes concurrently
      const [pkgsRes, addsRes] = await Promise.all([
        fetch("/api/services", { cache: "no-store" }),
        fetch("/api/addons", { cache: "no-store" }),
      ]);

      let pkgs = [];
      let adds = [];

      if (pkgsRes.ok) {
        const pkgsJson = await pkgsRes.json();
        if (pkgsJson.status === "success") {
          pkgs = pkgsJson.data?.services || [];
        }
      }

      if (addsRes.ok) {
        const addsJson = await addsRes.json();
        if (addsJson.status === "success") {
          adds = addsJson.data?.addons || [];
        }
      }

      console.log("=== MASTER DATA DEBUG ===");
      console.log("Packages:", pkgs);
      console.log("Packages array?", Array.isArray(pkgs));
      console.log("Addons:", adds);
      console.log("Addons array?", Array.isArray(adds));

      setPackagesData(Array.isArray(pkgs) ? pkgs : []);
      setAddonsData(Array.isArray(adds) ? adds : []);
    } catch (error) {
      console.error("Gagal sinkronisasi data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    refreshData();
  }, []);

  // --- LOGIKA PERAN (ROLE) ---
  const safeRole = userRole.toLowerCase();
  const isOwner = safeRole.includes("owner");
  const isB2B = safeRole.includes("b2b");
  const isB2C = safeRole.includes("b2c");
  const isEventManager = safeRole.includes("manager");

  // Hak akses untuk melihat harga
  const canSeeB2B = isOwner || isB2B || isEventManager;
  const canSeeB2C = isOwner || isB2C || isEventManager;

  // ================= STATE MODAL CRUD =================
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    price_b2b: "",
    price_b2c: "",
  });

  const t = {
    id: {
      title: "Master Data & Pengaturan",
      subtitle: "Kelola katalog paket utama dan layanan tambahan Hellobooth.",
      tabPackages: "Katalog Paket",
      tabAddons: "Layanan Tambahan",
      searchPlaceholder: "Cari katalog...",
      addBtn: "Tambah Data",
      colName: "Nama Layanan",
      colPrice: "Harga Resmi",
      colPriceB2B: "Harga B2B",
      colPriceB2C: "Harga B2C",
      colAction: "Aksi",
      noData: "Data belum tersedia.",
      modalAddTitle: "Tambah Data Baru",
      modalEditTitle: "Edit Data",
      formName: "Nama Layanan / Katalog",
      formPrice: "Harga Satuan (Rp)",
      formPriceB2B: "Harga Jual B2B (Rp)",
      formPriceB2C: "Harga Jual B2C (Rp)",
      save: "Simpan Data",
      cancel: "Batal",
    },
    en: {
      title: "Master Data & Settings",
      subtitle:
        "Manage main package catalog and Hellobooth additional services.",
      tabPackages: "Package Catalog",
      tabAddons: "Add-on Services",
      searchPlaceholder: "Search catalog...",
      addBtn: "Add Data",
      colName: "Service Name",
      colPrice: "Official Price",
      colPriceB2B: "B2B Price",
      colPriceB2C: "B2C Price",
      colAction: "Action",
      noData: "Data not available.",
      modalAddTitle: "Add New Data",
      modalEditTitle: "Edit Data",
      formName: "Service / Catalog Name",
      formPrice: "Unit Price (Rp)",
      formPriceB2B: "B2B Selling Price (Rp)",
      formPriceB2C: "B2C Selling Price (Rp)",
      save: "Save Data",
      cancel: "Cancel",
    },
  }[lang];

  // ================= LOGIKA PENGOLAHAN DATA =================
  const currentData = activeTab === "packages" ? packagesData : addonsData;

  // 1. Pencarian
  const filteredData = currentData.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // 2. Fungsi Eksekusi Sorting
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 3. Terapkan Sorting ke Data
  const sortedData = [...filteredData].sort((a: any, b: any) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;

    let valA = 0;
    let valB = 0;

    if (key === "price") {
      valA = Number(a.price) || Number(a.base_price) || 0;
      valB = Number(b.price) || Number(b.base_price) || 0;
    } else {
      valA = Number(a[key]) || 0;
      valB = Number(b[key]) || 0;
    }

    if (valA < valB) return direction === "asc" ? -1 : 1;
    if (valA > valB) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const formatRupiah = (val: any) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  // ================= FUNGSI CRUD (TAMPA DELETE) =================

  const handleOpenAdd = () => {
    if (!isOwner) return; // Proteksi ganda
    setSelectedItem(null);
    setFormData({ name: "", price: "", price_b2b: "", price_b2c: "" });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    if (!isOwner) return; // Proteksi ganda
    setSelectedItem(item);
    setFormData({
      name: item.name,
      price: item.price
        ? String(item.price)
        : item.base_price
          ? String(item.base_price)
          : "",
      price_b2b: item.price_b2b != null ? String(item.price_b2b) : "",
      price_b2c: item.price_b2c != null ? String(item.price_b2c) : "",
    });
    setIsFormModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;

    const numericPrice = parseInt(formData.price.replace(/\D/g, "")) || 0;
    const numericB2B = parseInt(formData.price_b2b.replace(/\D/g, "")) || 0;
    const numericB2C = parseInt(formData.price_b2c.replace(/\D/g, "")) || 0;

    try {
      if (activeTab === "packages") {
        const payload = {
          name: formData.name,
          price_b2b: numericB2B,
          price_b2c: numericB2C,
        };

        if (selectedItem) {
          // Update Package via Next.js API
          const res = await fetch(`/api/services/${selectedItem.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) throw new Error("Gagal mengupdate paket");
        } else {
          // Add Package via Next.js API
          const res = await fetch("/api/services", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) throw new Error("Gagal menambah paket");
        }
      } else {
        const payload = {
          name: formData.name,
          base_price: numericPrice,
        };

        if (selectedItem) {
          // Update Addon via Next.js API
          const res = await fetch(`/api/addons/${selectedItem.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Gagal mengupdate addon");
        } else {
          // Add Addon via Next.js API
          const res = await fetch("/api/addons", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Gagal menambah addon");
        }
      }

      await refreshData();
      setIsFormModalOpen(false);
    } catch (error) {
      alert("Gagal memproses data.");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {t.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.subtitle}
          </p>
        </div>

        {/* HANYA OWNER YANG BISA MELIHAT TOMBOL TAMBAH DATA */}
        {isOwner && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors font-medium shadow-sm shadow-primary/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>{t.addBtn}</span>
          </button>
        )}
      </div>

      {/* Kontrol Tab & Cari */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm transition-colors">
        <div className="flex gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl w-full md:w-auto border border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              setActiveTab("packages");
              setSearchQuery("");
              setSortConfig({
                key: canSeeB2C && !canSeeB2B ? "price_b2c" : "price_b2b",
                direction: "asc",
              });
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all w-full md:w-auto ${
              activeTab === "packages"
                ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Package className="w-4 h-4" /> {t.tabPackages}
          </button>
          <button
            onClick={() => {
              setActiveTab("addons");
              setSearchQuery("");
              setSortConfig({ key: "price", direction: "asc" });
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all w-full md:w-auto ${
              activeTab === "addons"
                ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Layers className="w-4 h-4" /> {t.tabAddons}
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-colors"
          />
        </div>
      </div>

      {/* Tabel Master Data */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.colName}
                </th>

                {/* HEADER HARGA SESUAI ROLE */}
                {activeTab === "packages" ? (
                  <>
                    {canSeeB2B && (
                      <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort("price_b2b")}
                          className="flex items-center gap-1.5 hover:text-slate-600 dark:hover:text-slate-200 transition-colors uppercase group"
                        >
                          {t.colPriceB2B}
                          <ArrowUpDown
                            className={`w-3.5 h-3.5 transition-colors ${sortConfig?.key === "price_b2b" ? "text-primary" : "text-slate-400 group-hover:text-slate-600"}`}
                          />
                        </button>
                      </th>
                    )}
                    {canSeeB2C && (
                      <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort("price_b2c")}
                          className="flex items-center gap-1.5 hover:text-slate-600 dark:hover:text-slate-200 transition-colors uppercase group"
                        >
                          {t.colPriceB2C}
                          <ArrowUpDown
                            className={`w-3.5 h-3.5 transition-colors ${sortConfig?.key === "price_b2c" ? "text-primary" : "text-slate-400 group-hover:text-slate-600"}`}
                          />
                        </button>
                      </th>
                    )}
                  </>
                ) : (
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("price")}
                      className="flex items-center gap-1.5 hover:text-slate-600 dark:hover:text-slate-200 transition-colors uppercase group"
                    >
                      {t.colPrice}
                      <ArrowUpDown
                        className={`w-3.5 h-3.5 transition-colors ${sortConfig?.key === "price" ? "text-primary" : "text-slate-400 group-hover:text-slate-600"}`}
                      />
                    </button>
                  </th>
                )}

                {/* HANYA OWNER YANG MELIHAT KOLOM AKSI */}
                {isOwner && (
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                    {t.colAction}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-slate-500 italic"
                  >
                    Memuat katalog...
                  </td>
                </tr>
              ) : sortedData.length > 0 ? (
                sortedData.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                        {item.name}
                      </p>
                    </td>

                    {/* KONTEN HARGA SESUAI ROLE */}
                    {activeTab === "packages" ? (
                      <>
                        {canSeeB2B && (
                          <td className="py-4 px-6 text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
                            {formatRupiah(item.price_b2b)}
                          </td>
                        )}
                        {canSeeB2C && (
                          <td className="py-4 px-6 text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            {formatRupiah(item.price_b2c)}
                          </td>
                        )}
                      </>
                    ) : (
                      <td className="py-4 px-6 text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
                        {formatRupiah(item.price || item.base_price)}
                      </td>
                    )}

                    {/* HANYA OWNER YANG MELIHAT TOMBOL EDIT */}
                    {isOwner && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-slate-500 font-medium"
                  >
                    {t.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL FORM (HANYA MUNCUL JIKA OWNER) ================= */}
      {isOwner && isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {selectedItem ? (
                  <Edit3 className="w-4 h-4 text-primary" />
                ) : (
                  <Plus className="w-4 h-4 text-primary" />
                )}
                {selectedItem ? t.modalEditTitle : t.modalAddTitle}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm}>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    {activeTab === "packages" ? (
                      <Package className="w-3.5 h-3.5" />
                    ) : (
                      <Layers className="w-3.5 h-3.5" />
                    )}
                    {t.formName} *
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={
                      activeTab === "packages"
                        ? "Contoh: Hello Express..."
                        : "Contoh: Keychain..."
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-300 transition-colors"
                  />
                </div>

                {activeTab === "packages" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" /> {t.formPriceB2B}{" "}
                        *
                      </label>
                      <input
                        required
                        type="number"
                        value={formData.price_b2b}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price_b2b: e.target.value,
                          })
                        }
                        placeholder="Harga B2B"
                        className="w-full px-4 py-2.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-700 dark:text-slate-300 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" /> {t.formPriceB2C}{" "}
                        *
                      </label>
                      <input
                        required
                        type="number"
                        value={formData.price_b2c}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price_b2c: e.target.value,
                          })
                        }
                        placeholder="Harga B2C"
                        className="w-full px-4 py-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-700 dark:text-slate-300 transition-colors"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" /> {t.formPrice} *
                    </label>
                    <input
                      required
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="Contoh: 150000"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-300 transition-colors"
                    />
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-primary text-white hover:bg-primary-hover rounded-xl transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" /> {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// src/app/admin/freelancers/[id]/edit/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import { useLanguage } from "@/providers/AppProvider";

export default function EditFreelancerPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const freelancerId = params?.id as string;

  // State form data freelancer
  const [formData, setFormData] = useState({
    name: "Rizky Ramadhan",
    role: "Lead Photographer",
    email: "rizky.photo@email.com",
    phone: "0812-3456-7890",
    address: "Jl. Margonda Raya, Depok, Jawa Barat",
  });

  const t = {
    id: {
      title: "Edit Informasi Kru",
      subtitle: "Perbarui data profil, kontak, dan keahlian utama freelancer.",
      saveBtn: "Simpan Perubahan",
      cancelBtn: "Batalkan",
      fields: {
        name: "Nama Lengkap Kru",
        role: "Keahlian Utama (Role)",
        email: "Alamat Email",
        phone: "Nomor WhatsApp",
        address: "Alamat Domisili",
      },
      placeholders: {
        name: "Masukkan nama freelancer...",
        email: "contoh@email.com",
        phone: "0812...",
        address: "Jalan, No Rumah, Kota...",
      },
      success: "Data freelancer berhasil diperbarui!",
    },
    en: {
      title: "Edit Crew Information",
      subtitle: "Update freelancer profile, contact, and main skills data.",
      saveBtn: "Save Changes",
      cancelBtn: "Cancel",
      fields: {
        name: "Crew Full Name",
        role: "Main Skill (Role)",
        email: "Email Address",
        phone: "WhatsApp Number",
        address: "Home Address",
      },
      placeholders: {
        name: "Enter freelancer name...",
        email: "example@email.com",
        phone: "0812...",
        address: "Street, House No, City...",
      },
      success: "Freelancer data updated successfully!",
    },
  }[lang];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t.success);
    router.push(`/admin/freelancers/${freelancerId}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header Halaman */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
          <User className="w-7 h-7 text-primary" />
          {t.title}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.subtitle}
        </p>
      </div>

      {/* Formulir Utama */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden transition-colors"
      >
        <div className="p-8 space-y-6">
          {/* Baris 1: Nama & Keahlian */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> {t.fields.name}
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder={t.placeholders.name}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" /> {t.fields.role}
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-all cursor-pointer"
              >
                <option value="Lead Photographer">Lead Photographer</option>
                <option value="Videographer">Videographer</option>
                <option value="Editor">Editor</option>
                <option value="Booth Captain">Booth Captain</option>
                <option value="Assistant / Crew">Assistant / Crew</option>
              </select>
            </div>
          </div>

          {/* Baris 2: Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> {t.fields.email}
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={t.placeholders.email}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> {t.fields.phone}
              </label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder={t.placeholders.phone}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-all font-mono"
              />
            </div>
          </div>

          {/* Baris 3: Address */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> {t.fields.address}
            </label>
            <textarea
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder={t.placeholders.address}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer Kendali: Tombol aksi */}
        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
          >
            {t.cancelBtn}
          </button>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 rounded-2xl text-sm font-black hover:bg-primary-hover transition-all shadow-lg shadow-primary/25 active:scale-95"
          >
            <Save className="w-4 h-4" />
            {t.saveBtn}
          </button>
        </div>
      </form>

      {/* Info Tambahan di Bawah */}
      <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
        <CheckCircle2 className="w-3 h-3" />
        Sinkronisasi Data Aktif
      </div>
    </div>
  );
}

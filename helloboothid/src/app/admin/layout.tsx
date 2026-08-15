// src/app/admin/layout.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Calendar,
  Camera,
  Receipt,
  Settings,
  LogOut,
  Moon,
  Sun,
  Languages,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/providers/AppProvider";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { lang, toggleLang } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // State user
  const [user, setUser] = useState({
    username: "Admin",
    initial: "A",
    subRole: "",
  });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");

        if (!res.ok) {
          console.warn(
            "API /auth/me tidak ditemukan atau bermasalah. Status:",
            res.status,
          );
          return;
        }

        const json = await res.json();
        if (json.status === "success") {
          const fetchedUsername = json.data?.username || "Admin";

          // JARING PENGAMAN: Ambil sub_role, subRole, atau role dari API
          const fetchedSubRole =
            json.data?.sub_role || json.data?.subRole || json.data?.role || "";

          // DEBUG LOG: Buka inspect console di browser untuk melihat data asli yang dikirim API
          console.log("=== DEBUG AUTH USER ===", json.data);

          setUser({
            username: fetchedUsername,
            initial: fetchedUsername.charAt(0).toUpperCase(),
            subRole: fetchedSubRole,
          });
        }
      } catch (err) {
        console.error("Gagal memuat data user. Detail:", err);
      }
    };

    fetchUser();
  }, []);

  const t = {
    id: {
      dashboard: "Dasbor",
      client: "Klien",
      events: "Event & Booking",
      schedule: "Jadwal",
      freelancer: "Freelancer",
      invoice: "Invoice",
      masterData: "Data Master",
      reports: "Laporan",
      logout: "Keluar",
      modalTitle: "Keluar Akun",
      modalMessage: "Apakah Anda yakin ingin keluar dari akun ini?",
      cancel: "Batal",
      confirmLogout: "Ya, Keluar Akun",
    },
    en: {
      dashboard: "Dashboard",
      client: "Clients",
      events: "Events & Booking",
      schedule: "Schedule",
      freelancer: "Freelancers",
      invoice: "Invoices",
      masterData: "Master Data",
      reports: "Reports",
      logout: "Logout",
      modalTitle: "Log Out",
      modalMessage: "Are you sure you want to log out of this account?",
      cancel: "Cancel",
      confirmLogout: "Yes, Log Out",
    },
  }[lang];

  // PERBAIKAN LOGIKA: Sembunyikan HANYA jika role/sub-role mengandung kata "sales"
  const safeSubRole = String(user.subRole).toLowerCase();
  const safeUsername = String(user.username).toLowerCase();

  const isSalesUser =
    safeSubRole.includes("sales") ||
    safeUsername.includes("b2b") ||
    safeUsername.includes("b2c");
  // Render menu secara dinamis
  const menuItems = [
    { name: t.dashboard, icon: LayoutDashboard, href: "/admin" },
    { name: t.client, icon: Users, href: "/admin/clients" },
    { name: t.events, icon: CalendarDays, href: "/admin/events" },
    { name: t.schedule, icon: Calendar, href: "/admin/calendar" },
    // Menu Freelancer akan tampil untuk SIAPAPUN, KECUALI tim Sales
    ...(!isSalesUser
      ? [{ name: t.freelancer, icon: Camera, href: "/admin/freelancers" }]
      : []),
    { name: t.invoice, icon: Receipt, href: "/admin/invoices" },
    { name: t.masterData, icon: Settings, href: "/admin/settings" },
  ];

  const handleExecuteLogout = async () => {
    setIsLogoutModalOpen(false);
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex h-screen font-sans overflow-hidden transition-colors duration-300">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden md:flex shadow-sm z-20 transition-colors duration-300">
        <div className="h-20 flex items-center justify-center border-b border-slate-100 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <Image
            src="/images/logo-hellobooth.png"
            alt="HelloBooth Logo"
            width={160}
            height={40}
            style={{ width: "auto", height: "auto" }}
            priority
          />
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(item.href) && item.href !== "/admin");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/30 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-primary-light dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white font-medium"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500"}`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 z-10 shadow-sm transition-colors duration-300">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white capitalize">
            {pathname === "/admin"
              ? lang === "id"
                ? "Ringkasan Dashboard"
                : "Dashboard Overview"
              : pathname.split("/")[2]?.replace("-", " ") || "Admin Panel"}
          </h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {mounted && (
                <>
                  <button
                    onClick={toggleLang}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Languages className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase">
                      {lang}
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                    className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {theme === "dark" ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">
                  {user.username}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary-light dark:bg-primary/20 rounded-full border border-primary/20 flex items-center justify-center text-primary font-bold">
                {user.initial}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-[#0b1120] transition-colors duration-300">
          {children}
        </div>
      </main>

      {/* LOGOUT MODAL */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">
                {t.modalTitle}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.modalMessage}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleExecuteLogout}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
              >
                {t.confirmLogout}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

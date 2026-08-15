// src/app/freelancer/layout.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  CalendarDays,
  User,
  LogOut,
  Moon,
  Sun,
  Languages,
  X,
  AlertTriangle,
  LogOut as LogOutIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/providers/AppProvider";

export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { lang, toggleLang } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // State Profil Navbar
  const [userData, setUserData] = useState({ username: "Crew", initial: "C" });

  // State Kontrol Modal Logout
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/auth/me?t=${Date.now()}`);
        if (!res.ok) return;

        const json = await res.json();
        if (json.status === "success" && json.data?.username) {
          const name = json.data.username;
          setUserData({
            username: name,
            initial: name.charAt(0).toUpperCase(),
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  // Fungsi Eksekusi Keluar Akun setelah Konfirmasi
  const handleExecuteLogout = async () => {
    setIsLogoutModalOpen(false);
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    }
  };

  const t = {
    id: {
      dashboard: "Dasbor",
      schedule: "Jadwal Saya",

      logout: "Keluar",
      role: "Kru / Freelancer",
      modalTitle: "Keluar Akun",
      modalMessage:
        "Apakah Anda yakin ingin keluar dari akun ini? Anda harus login kembali untuk masuk ke dasbor.",
      cancel: "Batal",
      confirmLogout: "Ya, Keluar Akun",
    },
    en: {
      dashboard: "Dashboard",
      schedule: "My Schedule",

      logout: "Logout",
      role: "Crew / Freelancer",
      modalTitle: "Log Out",
      modalMessage:
        "Are you sure you want to log out? You will need to re-enter your credentials to access your dashboard.",
      cancel: "Cancel",
      confirmLogout: "Yes, Log Out",
    },
  }[lang];

  const menuItems = [
    { name: t.dashboard, icon: LayoutDashboard, href: "/freelancer" },
    { name: t.schedule, icon: CalendarDays, href: "/freelancer/schedule" },
  ];

  if (!mounted) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0b1120] transition-colors duration-300 relative">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden md:flex shadow-sm z-20">
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

        <nav className="flex-1 py-6 px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-primary-light dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white capitalize">
            {pathname === "/freelancer"
              ? t.dashboard
              : menuItems.find((i) => i.href === pathname)?.name || "Crew"}
          </h1>

          <div className="flex items-center gap-4">
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
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Profil */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  {userData.username}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                  {t.role}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold border border-primary/20 uppercase">
                {userData.initial}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </main>

      {/* POP-UP MODAL KUSTOM: KONFIRMASI LOGOUT */}
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

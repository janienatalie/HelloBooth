// src/app/(auth)/login/page.tsx
"use client";

import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const LoginPage: NextPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      // 1. Panggil API Login
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json();

      if (json.status === "success") {
        // Logika Pengalihan Berdasarkan Role
        const userRole = json.data.role;

        // PERBAIKAN: Tambahkan pengecekan untuk role "owner"
        if (userRole === "admin" || userRole === "owner") {
          // Jika admin atau owner, lempar ke dashboard admin
          router.push("/admin");
        } else if (userRole === "freelancer" || userRole === "crew") {
          // Jika kru/freelancer, lempar ke dashboard freelancer
          router.push("/freelancer");
        } else {
          router.push("/");
        }
      } else {
        setErrorMsg(json.message); // Tampilkan error jika password salah
      }
    } catch (error) {
      setErrorMsg("Koneksi bermasalah. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - HelloBooth | Kelola Akun Anda</title>
      </Head>

      {/* BACKGROUND LUAR: Diberi warna abu-abu terang agar kontras dengan putihnya kontainer */}
      <div className="min-h-screen bg-slate-100 dark:bg-slate-200 flex items-center justify-center p-4 md:p-10 font-sans">
        {/* KONTAINER UTAMA: Memaksa warna background tetap putih meski dark mode */}
        <div className="bg-white dark:bg-white rounded-[32px] shadow-2xl flex max-w-7xl w-full overflow-hidden min-h-[85vh]">
          {/* SISI KIRI (FORM) */}
          <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center text-slate-800 dark:text-slate-800">
            <div className="mb-12">
              <div className="mb-8 flex items-center justify-center">
                <Image
                  src="/images/logo-hellobooth.png"
                  alt="HelloBooth Logo"
                  width={200}
                  height={50}
                  priority
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2 leading-tight">
                  Welcome Back!
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-500">
                  Login to manage your account
                </p>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-6">
              {/* Notifikasi Error */}
              {errorMsg && (
                <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold border border-rose-100 text-center">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-700"
                >
                  Enter your username
                </label>
                <input
                  id="username"
                  type="text"
                  maxLength={30}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin_hellobooth"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 bg-white dark:bg-white border border-slate-300 dark:border-slate-300 rounded-xl shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition duration-150 disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-700"
                >
                  Enter your password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"} // Logika pergantian tipe input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    disabled={isLoading}
                    // Tambahkan pr-12 agar teks panjang tidak menabrak ikon mata
                    className="w-full pl-4 pr-12 py-3.5 bg-white dark:bg-white border border-slate-300 dark:border-slate-300 rounded-xl shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3896F5]/20 focus:border-[#3896F5] transition duration-150 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="h-0.5"></div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white font-bold py-4 px-6 rounded-xl shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/50 transition duration-150 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>

          {/* SISI KANAN (GAMBAR) */}
          <div className="hidden md:flex w-1/2 bg-primary flex-col items-center justify-center relative overflow-hidden">
            <div className="w-full h-full relative -mt-4">
              <Image
                src="/images/landing-page.png"
                alt="Landing Page"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 0vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

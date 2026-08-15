// src/providers/AppProvider.tsx
"use client";

import { ThemeProvider } from "next-themes";
import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "id" | "en";

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within AppProvider");
  return context;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Set default bahasa
  const [lang, setLang] = useState<Language>("id");

  useEffect(() => {
    // Mengambil bahasa dari localStorage hanya saat di sisi klien (browser)
    const savedLang = localStorage.getItem("app-lang") as Language;
    if (savedLang) setLang(savedLang);
  }, []);

  const toggleLang = () => {
    const newLang = lang === "id" ? "en" : "id";
    setLang(newLang);
    localStorage.setItem("app-lang", newLang);
  };

  // Hapus kondisi if (!mounted) yang menyebabkan error SSR.
  // Provider harus SELALU membungkus children dalam kondisi apapun.
  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
      >
        {children}
      </ThemeProvider>
    </LanguageContext.Provider>
  );
}

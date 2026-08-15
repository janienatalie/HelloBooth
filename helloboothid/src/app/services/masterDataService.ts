// src/app/services/masterDataService.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const masterDataService = {
  // Ambil Data Paket Utama
  getPackages: async () => {
    const response = await fetch(`${BASE_URL}/services`, { cache: "no-store" });
    const result = await response.json();

    // Kembali menggunakan struktur data dari Hapi.js
    return result.data.services.map((s: any) => ({
      id: s.id.toString(),
      name: s.name,
      price_b2b: parseFloat(s.price_b2b) || 0,
      price_b2c: parseFloat(s.price_b2c) || 0,
    }));
  },

  // Tambah Data Paket
  addPackage: async (payload: any) => {
    const response = await fetch(`${BASE_URL}/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await response.json();
  },

  // Edit Data Paket
  updatePackage: async (id: string, payload: any) => {
    const response = await fetch(`${BASE_URL}/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await response.json();
  },

  // Hapus Data Paket
  deletePackage: async (id: string) => {
    const response = await fetch(`${BASE_URL}/services/${id}`, {
      method: "DELETE",
    });
    return await response.json();
  },

  // Ambil Data Addons
  getAddons: async () => {
    const response = await fetch(`${BASE_URL}/addons`, { cache: "no-store" });
    const result = await response.json();

    // Kembali menggunakan struktur data dari Hapi.js
    return result.data.addons.map((a: any) => ({
      id: a.id.toString(),
      name: a.name,
      price: parseFloat(a.base_price) || 0,
    }));
  },

  addAddon: async (payload: any) => {
    const response = await fetch(`${BASE_URL}/addons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await response.json();
  },

  updateAddon: async (id: string, payload: any) => {
    const response = await fetch(`${BASE_URL}/addons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await response.json();
  },

  deleteAddon: async (id: string) => {
    const response = await fetch(`${BASE_URL}/addons/${id}`, {
      method: "DELETE",
    });
    return await response.json();
  },
};

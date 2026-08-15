// src/app/services/clientService.ts
const BASE_URL = "http://localhost:5000/api";

export const clientService = {
  getClients: async () => {
    const response = await fetch(`${BASE_URL}/clients`, {
      cache: "no-store",
      credentials: "include", // <--- Ini yang menyuruh browser melampirkan cookie auth_token
    });

    const result = await response.json();
    if (result.status !== "success") throw new Error(result.message);
    return result.data.clients;
  },

  getClientById: async (id: string) => {
    const response = await fetch(`${BASE_URL}/clients/${id}`, {
      cache: "no-store",
      credentials: "include", // <--- Tambahkan di sini juga
    });
    const result = await response.json();
    return result.data.client;
  },

  addClient: async (payload: {
    name: string;
    email: string;
    phone: string;
    client_type?: string;
  }) => {
    const response = await fetch(`${BASE_URL}/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // <--- Tambahkan di sini juga
      body: JSON.stringify(payload),
    });
    return await response.json();
  },

  updateClient: async (
    id: string,
    payload: {
      name: string;
      email: string;
      phone: string;
      client_type?: string;
    },
  ) => {
    const response = await fetch(`${BASE_URL}/clients/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // <--- Tambahkan di sini juga
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || "Failed to update client");
    }
    return result;
  },

  deleteClient: async (id: string) => {
    const response = await fetch(`${BASE_URL}/clients/${id}`, {
      method: "DELETE",
      credentials: "include", // <--- Tambahkan di sini juga
    });

    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || "Gagal menghapus klien");
    }
    return result;
  },
};

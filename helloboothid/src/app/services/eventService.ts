// src/app/services/eventService.ts
const BASE_URL = "http://localhost:5000/api";

export const eventService = {
  addEvent: async (payload: any) => {
    const response = await fetch(`${BASE_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await response.json();
  },

  getEvents: async () => {
    const response = await fetch("/api/events"); // Memanggil route API Next.js kita
    return await response.json();
  },
};

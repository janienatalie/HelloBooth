// src/app/services/freelancerService.ts
export const freelancerService = {
  // Ambil semua freelancer
  getFreelancers: async () => {
    const response = await fetch("/api/freelancers");
    return await response.json();
  },

  // Tambah freelancer baru
  createFreelancer: async (data: any) => {
    const response = await fetch("/api/freelancers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await response.json();
  },
};

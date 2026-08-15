// src/app/owner/settings/page.tsx
import MasterDataPage from "@/app/admin/settings/page"; // <-- Kita panggil komponen aslinya

export const metadata = {
  title: "Master Data - Owner",
  description: "Pengaturan harga dasar dan katalog produk Hellobooth",
};

// Karena logika pengecekan Role (isOwner) sudah berada di dalam komponen MasterDataPage
// (berdasarkan API /auth/me), kita bisa langsung menggunakannya (re-use) di sini tanpa menulis ulang ribuan baris kode!
export default function OwnerSettingsPage() {
  return <MasterDataPage />;
}

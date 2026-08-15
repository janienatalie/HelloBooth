// src/lib/db.ts
import { Pool } from "pg";

// Pastikan password dibaca sebagai string, bukan undefined
const pool = new Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "hellobooth_db",
  password: String(process.env.PGPASSWORD || "postgres123"), // Ini kuncinya: Memaksa jadi string
  port: Number(process.env.PGPORT) || 5432,
});

// Fungsi pembantu untuk menjalankan query
export const query = (text: string, params?: any[]) => pool.query(text, params);

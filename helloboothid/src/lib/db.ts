// src/lib/db.ts
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Fungsi pembantu untuk menjalankan query
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export default pool;

const { Pool } = require("pg");
const { nanoid } = require("nanoid");

class ClientsService {
  constructor() {
    this._pool = new Pool();
  }

  // UPDATE: Tambahkan client_type saat menambahkan klien baru
  async addClient({ name, email, phone, client_type }) {
    const id = `cli-${nanoid(16)}`;
    // Default fallback ke B2C jika client_type tidak disediakan
    const type = client_type || "B2C";
    const query = {
      text: "INSERT INTO clients(id, name, email, phone, client_type) VALUES($1, $2, $3, $4, $5) RETURNING id",
      values: [id, name, email, phone, type],
    };

    const result = await this._pool.query(query);
    return result.rows[0].id;
  }

  // UPDATE: Menerima argumen subRole untuk filter divisi
  async getClients(subRole = "Admin General") {
    let clientFilterQuery = "";
    const safeRole = String(subRole).toLowerCase();

    // Logika Pemisahan Data
    if (safeRole.includes("b2b")) {
      clientFilterQuery = "WHERE UPPER(c.client_type) = 'B2B'";
    } else if (safeRole.includes("b2c")) {
      clientFilterQuery = "WHERE UPPER(c.client_type) = 'B2C'";
    }

    const query = {
      text: `
      SELECT 
        c.*, 
        COUNT(e.id)::int AS total_events 
      FROM clients c
      LEFT JOIN events e ON c.id = e.client_id
      ${clientFilterQuery}
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getClientById(id) {
    const clientQuery = {
      text: "SELECT * FROM clients WHERE id = $1",
      values: [id],
    };
    const clientResult = await this._pool.query(clientQuery);

    if (!clientResult.rows.length) {
      throw new Error("Klien tidak ditemukan");
    }

    const eventsQuery = {
      text: "SELECT id, event_name, event_date, location, status FROM events WHERE client_id = $1 ORDER BY event_date DESC",
      values: [id],
    };
    const eventsResult = await this._pool.query(eventsQuery);

    const client = clientResult.rows[0];
    client.events = eventsResult.rows;

    return client;
  }

  // UPDATE: Tambahkan client_type ke operasi edit
  async editClientById(id, { name, email, phone, client_type }) {
    const query = {
      text: "UPDATE clients SET name = $1, email = $2, phone = $3, client_type = COALESCE($4, client_type) WHERE id = $5 RETURNING id",
      values: [name, email, phone, client_type, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new Error("Gagal memperbarui klien. Id tidak ditemukan");
    }
  }

  async deleteClientById(id) {
    const query = {
      text: "DELETE FROM clients WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new Error("Klien gagal dihapus. Id tidak ditemukan");
    }
  }
}

module.exports = ClientsService;

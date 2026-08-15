const { Pool } = require("pg");
const { nanoid } = require("nanoid");

class EventsService {
  constructor() {
    this._pool = new Pool();
  }

  async addEvent({
    client_id,
    event_name,
    event_date,
    event_time,
    location,
    notes,
    backdrop_theme,
    items,
  }) {
    const client = await this._pool.connect(); // Menggunakan client koneksi untuk transaksi

    try {
      await client.query("BEGIN"); // Mulai Transaksi

      // 1. Simpan Header ke tabel events
      const id = `evt-${nanoid(16)}`;
      const queryEvent = {
        text: `INSERT INTO events(
             id, client_id, event_name, event_date, event_time, location, notes, backdrop_theme
           ) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        values: [
          id,
          client_id,
          event_name,
          event_date,
          event_time,
          location,
          notes || null, // Beri fallback null
          backdrop_theme || null, // Masukkan backdrop
        ],
      };
      const resultEvent = await client.query(queryEvent);
      const eventId = resultEvent.rows[0].id;

      // 2. Simpan Detail ke tabel event_items (Looping semua item)
      let total_price = 0;

      for (const item of items) {
        const table = item.item_type === "service" ? "services" : "addons";
        const priceQuery = await client.query(
          table === "services"
            ? `SELECT name, price_b2b, price_b2c FROM services WHERE id = $1`
            : `SELECT name, base_price FROM addons WHERE id = $1`,
          [item.item_id],
        );

        if (priceQuery.rows.length > 0) {
          const row = priceQuery.rows[0];
          const itemName = row.name || item.item_name || "Unknown Item";
          let itemPrice = Number(item.price ?? item.item_price ?? 0);

          if (!itemPrice) {
            if (table === "services") {
              itemPrice = Number(row.price_b2c || 0);
            } else {
              itemPrice = Number(row.base_price || 0);
            }
          }

          const quantity = Number(item.quantity) || 1;
          const subtotal = itemPrice * quantity;
          total_price += subtotal;

          const queryItem = {
            text: "INSERT INTO event_items(event_id, item_id, item_type, item_name, item_price, quantity, backdrop_theme, notes) VALUES($1, $2, $3, $4, $5, $6, $7, $8)",
            values: [
              eventId,
              item.item_id,
              item.item_type,
              itemName,
              itemPrice,
              quantity,
              item.backdrop || item.backdrop_theme || null,
              item.notes || item.itemNotes || null,
            ],
          };
          await client.query(queryItem);
        }
      }

      // 3. Update total_price di tabel events setelah semua item dihitung
      await client.query("UPDATE events SET total_price = $1 WHERE id = $2", [
        total_price,
        eventId,
      ]);

      await client.query("COMMIT"); // Simpan semua perubahan
      return eventId;
    } catch (error) {
      await client.query("ROLLBACK"); // Batalkan jika ada error di tengah jalan
      throw error;
    } finally {
      client.release(); // Kembalikan koneksi ke pool
    }
  }

  // Fungsi untuk mengambil list event (untuk tabel di Dashboard)
  async getEvents() {
    const query = {
      text: `SELECT events.*, clients.name as client_name 
             FROM events 
             LEFT JOIN clients ON clients.id = events.client_id
             ORDER BY event_date DESC`,
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = EventsService;

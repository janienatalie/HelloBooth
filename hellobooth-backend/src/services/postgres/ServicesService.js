const { Pool } = require("pg");
const { nanoid } = require("nanoid");

class ServicesService {
  constructor() {
    this._pool = new Pool();
  }

  async addService({ name, price_b2b, price_b2c }) {
    const id = `srv-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO services(id, name, price_b2b, price_b2c) VALUES($1, $2, $3, $4) RETURNING id",
      values: [id, name, price_b2b, price_b2c],
    };

    const result = await this._pool.query(query);
    return result.rows[0].id;
  }

  async getServices() {
    const query = "SELECT * FROM services";
    const result = await this._pool.query(query);
    return result.rows;
  }

  // PERBAIKAN: Terima parameter price_b2b dan price_b2c
  async editServiceById(id, { name, price_b2b, price_b2c }) {
    const client = await this._pool.connect();
    try {
      console.log("Service: Updating Service...", id);
      await client.query("BEGIN");

      const selectQuery = {
        text: "SELECT name, price_b2b, price_b2c FROM services WHERE id = $1",
        values: [id],
      };
      const selectRes = await client.query(selectQuery);
      if (!selectRes.rows.length) {
        await client.query("ROLLBACK");
        throw new Error("Gagal memperbarui layanan. Id tidak ditemukan");
      }

      const old = selectRes.rows[0];

      const updateQuery = {
        text: "UPDATE services SET name = $1, price_b2b = $2, price_b2c = $3 WHERE id = $4 RETURNING id",
        values: [name, price_b2b, price_b2c, id],
      };

      const updateRes = await client.query(updateQuery);
      console.log("Service: Service updated (DB).", id);

      const insertHistory = {
        text: `INSERT INTO price_history_log(
          service_id, addon_id, item_name, old_price_b2b, new_price_b2b,
          old_price_b2c, new_price_b2c, old_base_price, new_base_price, changed_at
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
        values: [
          id,
          null,
          name,
          old.price_b2b,
          price_b2b,
          old.price_b2c,
          price_b2c,
          null,
          null,
        ],
      };
      console.log("Service: Inserting Service history...", id);
      await client.query(insertHistory);
      console.log("Service: Service history inserted.", id);

      await client.query("COMMIT");

      if (!updateRes.rows.length) {
        throw new Error("Gagal memperbarui layanan. Id tidak ditemukan");
      }
    } catch (error) {
      console.error(error);
      try {
        await client.query("ROLLBACK");
      } catch (e) {
        console.error(e);
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteServiceById(id) {
    const query = {
      text: "DELETE FROM services WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new Error("Layanan gagal dihapus. Id tidak ditemukan");
    }
  }
}

module.exports = ServicesService;

const { Pool } = require("pg");
const { nanoid } = require("nanoid");

class AddonsService {
  constructor() {
    this._pool = new Pool();
  }

  // PERBAIKAN: Terima parameter base_price dari frontend
  async addAddon({ name, base_price }) {
    const id = `addon-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO addons(id, name, base_price) VALUES($1, $2, $3) RETURNING id",
      values: [id, name, base_price],
    };

    const result = await this._pool.query(query);
    return result.rows[0].id;
  }

  async getAddons() {
    const result = await this._pool.query("SELECT * FROM addons");
    return result.rows;
  }

  // PERBAIKAN: Terima parameter base_price dari frontend
  async editAddonById(id, { name, base_price }) {
    const client = await this._pool.connect();
    try {
      console.log("Add-on: Updating Add-on...", id);
      await client.query("BEGIN");

      const selectQuery = {
        text: "SELECT name, base_price FROM addons WHERE id = $1",
        values: [id],
      };
      const selectRes = await client.query(selectQuery);
      if (!selectRes.rows.length) {
        await client.query("ROLLBACK");
        throw new Error("Gagal memperbarui addon. Id tidak ditemukan");
      }

      const old = selectRes.rows[0];

      const updateQuery = {
        text: "UPDATE addons SET name = $1, base_price = $2 WHERE id = $3 RETURNING id",
        values: [name, base_price, id],
      };
      const updateRes = await client.query(updateQuery);
      console.log("Add-on: Add-on updated (DB).", id);

      const insertHistory = {
        text: `INSERT INTO price_history_log(
          service_id, addon_id, item_name, old_price_b2b, new_price_b2b,
          old_price_b2c, new_price_b2c, old_base_price, new_base_price, changed_at
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
        values: [
          null,
          id,
          name,
          null,
          null,
          null,
          null,
          old.base_price,
          base_price,
        ],
      };
      console.log("Add-on: Inserting Add-on history...", id);
      await client.query(insertHistory);
      console.log("Add-on: Add-on history inserted.", id);

      await client.query("COMMIT");

      if (!updateRes.rows.length) {
        throw new Error("Gagal memperbarui addon. Id tidak ditemukan");
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

  async deleteAddonById(id) {
    const query = {
      text: "DELETE FROM addons WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length)
      throw new Error("Addon gagal dihapus. Id tidak ditemukan");
  }
}

module.exports = AddonsService;

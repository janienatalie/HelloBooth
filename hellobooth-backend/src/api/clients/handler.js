class ClientsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postClientHandler = this.postClientHandler.bind(this);
    this.getClientsHandler = this.getClientsHandler.bind(this);
    this.getClientByIdHandler = this.getClientByIdHandler.bind(this);
    this.putClientByIdHandler = this.putClientByIdHandler.bind(this);
    this.deleteClientByIdHandler = this.deleteClientByIdHandler.bind(this);
  }

  async postClientHandler(request, h) {
    try {
      this._validator.validateClientPayload(request.payload);

      // Tangkap sub_role dari auth user yang sedang login
      const subRole = request.auth.credentials?.sub_role || "";
      const safeRole = String(subRole).toLowerCase();

      // ====================================================================
      // VALIDASI KEAMANAN: Cek apakah user adalah tim Sales
      // ====================================================================
      const isSales =
        safeRole.includes("sales") ||
        safeRole.includes("b2b") ||
        safeRole.includes("b2c");

      if (!isSales) {
        const error = new Error(
          "Akses ditolak: Hanya tim Sales yang diizinkan menambahkan klien baru.",
        );
        error.statusCode = 403; // Kode 403 = Forbidden (Akses dilarang)
        throw error;
      }

      // Otomatis tentukan tipe klien berdasarkan sales yang menambahkannya
      let autoClientType = "B2C"; // Default
      if (safeRole.includes("b2b")) {
        autoClientType = "B2B";
      }

      // Gabungkan dengan payload request
      const { name, email, phone, client_type } = request.payload;
      const finalClientType = client_type || autoClientType;

      const clientId = await this._service.addClient({
        name,
        email,
        phone,
        client_type: finalClientType,
      });

      const response = h.response({
        status: "success",
        message: "Client berhasil ditambahkan",
        data: { clientId },
      });
      response.code(201);
      return response;
    } catch (error) {
      return h
        .response({ status: "fail", message: error.message })
        .code(error.statusCode || 400);
    }
  }

  async getClientsHandler(request, h) {
    // Ambil identitas divisi/sub_role dari user yang merequest
    const subRole = request.auth.credentials?.sub_role || "Admin General";

    // Lempar subRole ke service agar disaring di level database
    const clients = await this._service.getClients(subRole);
    return {
      status: "success",
      data: { clients },
    };
  }

  async getClientByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const client = await this._service.getClientById(id);

      return {
        status: "success",
        data: { client },
      };
    } catch (error) {
      return h.response({ status: "fail", message: error.message }).code(404);
    }
  }

  async putClientByIdHandler(request, h) {
    try {
      this._validator.validateClientPayload(request.payload);
      const { id } = request.params;

      // Sertakan client_type
      await this._service.editClientById(id, request.payload);

      return {
        status: "success",
        message: "Client berhasil diperbarui",
      };
    } catch (error) {
      return h
        .response({ status: "fail", message: error.message })
        .code(error.statusCode || 404);
    }
  }

  async deleteClientByIdHandler(request, h) {
    try {
      // ====================================================================
      // VALIDASI KEAMANAN: HANYA SALES YANG BISA MENGHAPUS CLIENT
      // ====================================================================
      const subRole = request.auth.credentials?.sub_role || "";
      const safeRole = String(subRole).toLowerCase();
      const isSales =
        safeRole.includes("sales") ||
        safeRole.includes("b2b") ||
        safeRole.includes("b2c");

      if (!isSales) {
        const error = new Error(
          "Akses ditolak: Hanya tim Sales yang diizinkan menghapus data klien.",
        );
        error.statusCode = 403;
        throw error;
      }

      const { id } = request.params;
      await this._service.deleteClientById(id);

      return {
        status: "success",
        message: "Client berhasil dihapus",
      };
    } catch (error) {
      return h
        .response({ status: "fail", message: error.message })
        .code(error.statusCode || 404);
    }
  }
}

module.exports = ClientsHandler;

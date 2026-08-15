class ServicesHandler {
  // Tambahkan validator di dalam constructor
  constructor(service, validator) {
    this._service = service;
    this._validator = validator; // Menyimpan fungsi satpam

    this.postServiceHandler = this.postServiceHandler.bind(this);
    this.getServicesHandler = this.getServicesHandler.bind(this);
  }

  async postServiceHandler(request, h) {
    try {
      // 1. Validasi dulu sebelum masuk ke database!
      this._validator.validateServicePayload(request.payload);

      // 2. Jika aman, baru masukkan ke database
      const { name, price_b2b, price_b2c } = request.payload;
      const serviceId = await this._service.addService({
        name,
        price_b2b,
        price_b2c,
      });

      const response = h.response({
        status: "success",
        message: "Layanan berhasil ditambahkan",
        data: { serviceId },
      });
      response.code(201);
      return response;
    } catch (error) {
      // Jika error validasi, tangkap dan kembalikan status 400 (Bad Request)
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(400);
      return response;
    }
  }

  async getServicesHandler(request, h) {
    const services = await this._service.getServices();
    return {
      status: "success",
      data: { services },
    };
  }
}

module.exports = ServicesHandler;

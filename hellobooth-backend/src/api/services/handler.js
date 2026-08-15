class ServicesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postServiceHandler = this.postServiceHandler.bind(this);
    this.getServicesHandler = this.getServicesHandler.bind(this);
    this.putServiceByIdHandler = this.putServiceByIdHandler.bind(this);
    this.deleteServiceByIdHandler = this.deleteServiceByIdHandler.bind(this);
  }

  async postServiceHandler(request, h) {
    try {
      this._validator.validateServicePayload(request.payload);

      // PERBAIKAN: Tangkap price_b2b dan price_b2c, bukan lagi basePrice
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

  async putServiceByIdHandler(request, h) {
    try {
      this._validator.validateServicePayload(request.payload);

      const { id } = request.params;

      // PERBAIKAN: Tangkap price_b2b dan price_b2c
      const { name, price_b2b, price_b2c } = request.payload;

      console.log("Updating Service...", id);
      await this._service.editServiceById(id, {
        name,
        price_b2b,
        price_b2c,
      });
      console.log("Service updated.", id);

      return {
        status: "success",
        message: "Layanan berhasil diperbarui",
      };
    } catch (error) {
      console.error(error);
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(error.statusCode || 400);
      return response;
    }
  }

  async deleteServiceByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteServiceById(id);

      return {
        status: "success",
        message: "Layanan berhasil dihapus",
      };
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(error.statusCode || 404);
      return response;
    }
  }
}

module.exports = ServicesHandler;

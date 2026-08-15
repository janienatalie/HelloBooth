class AddonsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this.postAddonHandler = this.postAddonHandler.bind(this);
    this.getAddonsHandler = this.getAddonsHandler.bind(this);
    this.putAddonByIdHandler = this.putAddonByIdHandler.bind(this);
    this.deleteAddonByIdHandler = this.deleteAddonByIdHandler.bind(this);
  }

  async postAddonHandler(request, h) {
    try {
      this._validator.validateAddonPayload(request.payload);
      const { name, base_price } = request.payload;
      const id = await this._service.addAddon({ name, base_price });
      return h.response({ status: "success", data: { addonId: id } }).code(201);
    } catch (error) {
      return h.response({ status: "fail", message: error.message }).code(400);
    }
  }

  async getAddonsHandler() {
    const addons = await this._service.getAddons();
    return { status: "success", data: { addons } };
  }

  async putAddonByIdHandler(request, h) {
    try {
      this._validator.validateAddonPayload(request.payload);
      const { id } = request.params;
      const { name, base_price } = request.payload;
      console.log("Updating Add-on...", id);
      await this._service.editAddonById(id, { name, base_price });
      console.log("Add-on updated.", id);
      return { status: "success", message: "Addon diperbarui" };
    } catch (error) {
      console.error(error);
      return h.response({ status: "fail", message: error.message }).code(404);
    }
  }

  async deleteAddonByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteAddonById(id);
      return { status: "success", message: "Addon dihapus" };
    } catch (error) {
      return h.response({ status: "fail", message: error.message }).code(404);
    }
  }
}
module.exports = AddonsHandler;

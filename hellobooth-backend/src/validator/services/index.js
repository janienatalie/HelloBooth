const { ServicePayloadSchema } = require("./schema");

const ServicesValidator = {
  validateServicePayload: (payload) => {
    const validationResult = ServicePayloadSchema.validate(payload);

    // Jika ada error (misal harga diisi huruf), lemparkan error-nya
    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  },
};

module.exports = ServicesValidator;

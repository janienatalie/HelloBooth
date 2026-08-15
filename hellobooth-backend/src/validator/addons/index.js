const { AddonPayloadSchema } = require("./schema");

const AddonsValidator = {
  validateAddonPayload: (payload) => {
    const validationResult = AddonPayloadSchema.validate(payload);

    // Jika ada error (misal harga diisi huruf), lemparkan error-nya
    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  },
};

module.exports = AddonsValidator;

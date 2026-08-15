const { ClientPayloadSchema } = require("./schema");

const ClientsValidator = {
  validateClientPayload: (payload) => {
    const validationResult = ClientPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  },
};

module.exports = ClientsValidator;

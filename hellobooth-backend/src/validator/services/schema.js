const Joi = require("joi");

const ServicePayloadSchema = Joi.object({
  name: Joi.string().required(),
  price_b2b: Joi.number().min(0).required(), // Harus angka dan minimal 0 (tidak boleh minus)
  price_b2c: Joi.number().min(0).required(), // Harus angka dan minimal 0 (tidak boleh minus)
});

module.exports = { ServicePayloadSchema };

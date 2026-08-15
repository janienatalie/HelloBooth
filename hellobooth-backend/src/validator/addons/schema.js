const Joi = require("joi");

const AddonPayloadSchema = Joi.object({
  name: Joi.string().required(),
  base_price: Joi.number().min(0).required(), // Harus angka dan minimal 0 (tidak boleh minus)
});

module.exports = { AddonPayloadSchema };

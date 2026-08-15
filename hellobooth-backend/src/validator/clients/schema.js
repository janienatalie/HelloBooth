const Joi = require("joi");

const ClientPayloadSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  phone: Joi.string().required(),
});

module.exports = { ClientPayloadSchema };

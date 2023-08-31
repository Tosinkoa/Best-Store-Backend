import Joi from "joi";

const validator = (schema) => (payload) =>
  schema.validate(payload, { abortEarly: false });

const bargainSchema = Joi.object({
  amount: Joi.number()
    .min(1)
    .required()
    .label("Amount is required and must be of number, min of 1"),
});

export const validateBargain = validator(bargainSchema);

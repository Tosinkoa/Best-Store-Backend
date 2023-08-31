import Joi from "joi";

const validator = (schema) => (payload) =>
  schema.validate(payload, { abortEarly: false });

const sellerSchema = Joi.object({
  business_name: Joi.string()
    .min(2)
    .max(60)
    .required()
    .trim()
    .label("Business name is required, min of 2 and max of 60 characters"),
  about: Joi.string()
    .min(10)
    .max(200)
    .required()
    .trim()
    .label("About is required, min of 10 and max of 200 characters"),
  state: Joi.string()
    .min(10)
    .max(60)
    .required()
    .trim()
    .label("State is required, min of 10 and max of 60 characters"),
  city: Joi.string()
    .min(10)
    .max(60)
    .required()
    .trim()
    .label("City is required, min of 10 and max of 60 characters"),
});

export const validateSeller = validator(sellerSchema);

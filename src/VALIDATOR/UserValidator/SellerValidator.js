import Joi from "joi";
import { options } from "../joiOption.js";

const validator = (schema) => (payload) => schema.validate(payload, options);

const sellerSchema = Joi.object({
  business_name: Joi.string().min(2).max(60).required().trim(),
  about: Joi.string().min(10).max(200).required().trim(),
  state: Joi.string().required().trim(),
  city: Joi.string().required().trim(),
});

export const validateSeller = validator(sellerSchema);

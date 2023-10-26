import Joi from "joi";
import { options } from "../joiOption.js";

const validator = (schema) => (payload) => schema.validate(payload, options);

const bargainSchema = Joi.object({
  amount: Joi.number().min(1).required(),
});

export const validateBargain = validator(bargainSchema);

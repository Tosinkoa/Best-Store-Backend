import Joi from "joi";
import { options } from "../joiOption.js";

const validator = (schema) => (payload) => schema.validate(payload, options);

const addToCartSchema = Joi.object({
  product_count: Joi.number().min(1).max(20).required(),
});

const removeFromCartSchema = Joi.object({
  product_count: Joi.number().max(20).optional(),
});

export const validateRemoveFromCart = validator(removeFromCartSchema);
export const validateAddToCart = validator(addToCartSchema);

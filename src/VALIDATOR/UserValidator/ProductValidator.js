import Joi from "joi";
import { options } from "../joiOption.js";

const validator = (schema) => (payload) => schema.validate(payload, options);

const productSchema = Joi.object({
  name: Joi.string().min(5).max(100).required().trim(),
  description: Joi.string().min(20).max(30000).required().trim(),
  price: Joi.number().precision(2).min(150).max(1000000).required(),
  crossed_out_price: Joi.number().precision(2).optional(),
  bargain: Joi.boolean().optional(),
  category_id: Joi.number().required(),
  sub_category_id: Joi.number().optional(),
  in_stock: Joi.number().min(1).max(50000).optional(),
  product_image: Joi.optional(),
});

export const validateProduct = validator(productSchema);

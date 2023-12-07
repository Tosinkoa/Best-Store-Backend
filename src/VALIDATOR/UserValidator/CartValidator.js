import Joi from "joi";
import { options } from "../joiOption.js";

const validator = (schema) => (payload) => schema.validate(payload, options);

const addToCartSchema = Joi.object({
  product_count: Joi.number().min(1).max(20).required(),
});

const productSchema = Joi.array()
  .items(
    Joi.object({
      product_id: Joi.number(),
      product_count: Joi.number(),
    })
  )
  .has(
    Joi.object({ product_id: Joi.number().required(), product_count: Joi.number().required() })
  );

const addBulkToCartSchema = Joi.object({
  cart_products: productSchema,
});

const removeFromCartSchema = Joi.object({
  product_count: Joi.number().max(20).optional(),
});

export const validateRemoveFromCart = validator(removeFromCartSchema);
export const validateAddBulkToCart = validator(addBulkToCartSchema);
export const validateAddToCart = validator(addToCartSchema);

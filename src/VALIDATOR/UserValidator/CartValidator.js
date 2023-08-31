import Joi from "joi";

const validator = (schema) => (payload) =>
  schema.validate(payload, { abortEarly: false });

const addToCartSchema = Joi.object({
  product_count: Joi.number()
    .min(1)
    .max(20)
    .required()
    .label("Product count must be a number, min of 1 and max of 20"),
});

const removeFromCartSchema = Joi.object({
  product_count: Joi.number()
    .min(1)
    .max(20)
    .optional()
    .label("Product count must be a number, min of 1 and max of 20"),
});

export const validateRemoveFromCart = validator(removeFromCartSchema);
export const validateAddToCart = validator(addToCartSchema);

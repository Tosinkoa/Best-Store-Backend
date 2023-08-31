import Joi from "joi";

const validator = (schema) => (payload) =>
  schema.validate(payload, { abortEarly: false });

const productSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .trim()
    .label("Product name is required, min of 2 and max of 100 characters"),
  brand: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .trim()
    .label("Product name is optional, min of 2 and max of 50 characters"),
  description: Joi.string()
    .min(20)
    .max(3000)
    .required()
    .trim()
    .label("Description is required, min of 20 and max of 3000 characters"),
  price: Joi.number()
    .precision(2)
    .min(150)
    .max(1000000)
    .required()
    .label("Price is required, type of decimal, min of 150 and max of 1,000,000"),
  crossed_out_price: Joi.number().precision(2).optional(),
  bargain: Joi.boolean().optional(),
  cartegory_id: Joi.string().required().label("Cartegory id is missing!"),
  sub_cartegory_id: Joi.string().optional(),
  in_stock: Joi.number().min(0).max(50000).optional(),
});

export const validateProduct = validator(productSchema);

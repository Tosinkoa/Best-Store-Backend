import Joi from "joi";
import { options } from "../joiOption.js";

const validator = (schema) => (payload) => schema.validate(payload, options);

// Login Validator
const loginUserSchema = Joi.object({
  email: Joi.string().email().required().max(255).trim(),
  password: Joi.string().min(8).max(20).required(),
  remember: Joi.boolean().optional(),
});

// Register Validator
const registerUserSchema = Joi.object({
  first_name: Joi.string().min(2).max(60).required().trim(),
  last_name: Joi.string().min(2).max(60).required(),
  email: Joi.string().email().required().max(255).trim(),
  phone_number: Joi.string().min(11).max(11).trim(),
  password: Joi.string().min(8).max(20).required(),
  remember: Joi.boolean().optional(),
});

export const validateRegisterUser = validator(registerUserSchema);
export const validateLoginUser = validator(loginUserSchema);

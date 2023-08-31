import Joi from "joi";

const validator = (schema) => (payload) =>
  schema.validate(payload, { abortEarly: false });

// Login Validator
const loginUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .max(255)
    .label("Kindly add a valid email, max range is 255")
    .trim(),
  password: Joi.string()
    .min(8)
    .max(20)
    .required()
    .label("Password name is required, min of 2 and max of 20 characters"),
  remember: Joi.boolean().optional(),
});

// Register Validator
const registerUserSchema = Joi.object({
  first_name: Joi.string()
    .min(2)
    .max(60)
    .required()
    .label("First name is required, min of 2 and max of 60 characters")
    .trim(),
  last_name: Joi.string()
    .min(2)
    .max(60)
    .required()
    .label("Last name is required, min of 2 and max of 60 characters"),
  email: Joi.string().email().required().label("Pls add a valid email").max(255).trim(),
  phone_number: Joi.string()
    .min(11)
    .max(11)
    .label("Phone number should not be more than 11 characters")
    .trim(),
  password: Joi.string()
    .min(8)
    .max(20)
    .required()
    .label("Password is required, min 8 and max 20 characters"),
  remember: Joi.boolean().optional(),
});

export const validateRegisterUser = validator(registerUserSchema);
export const validateLoginUser = validator(loginUserSchema);

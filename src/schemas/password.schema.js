import Joi from "joi";

export const PasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
    .required()
    .messages({
      "string.min":       "Password must be at least 8 characters long",
      "string.pattern.base": "Password must include an uppercase letter, a number and a special character",
      "any.required":     "Password is required"
    })
});

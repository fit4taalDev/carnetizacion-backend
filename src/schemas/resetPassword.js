import Joi from "joi";

export const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .pattern(/[A-Z]/)
    .pattern(/[0-9]/)
    .pattern(/[^A-Za-z0-9]/)
    .required(),
  token: Joi.string().required()
});
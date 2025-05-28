import Joi from "joi";

export const resetPaswordEmailSchema = Joi.object({
    email: Joi.string().email().required(),
})
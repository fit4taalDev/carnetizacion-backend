import Joi from "joi";

export const administratorSchema = Joi.object({
    name: Joi.string().required().min(3),
    lastname: Joi.string().required().min(3),
    phone_number: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required()
})
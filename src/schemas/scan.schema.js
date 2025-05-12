import Joi from "joi";

export const scanSchema = Joi.object({
    student_id: Joi.string().required(),
    sig: Joi.string().required()
})
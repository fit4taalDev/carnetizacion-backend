import Joi from "joi";

export const OfferSchema = Joi.object({
    title: Joi.string().required().min(3),
    description: Joi.string().required().min(3), 
    start_date: Joi.date().required(),
    end_date: Joi.date().required(),
    student_role_ids: Joi.array().items(Joi.number().integer()).optional()
})
import Joi from "joi";

export const OfferSchema = Joi.object({
    title: Joi.string().required().min(3),
    description: Joi.string().required().min(3), 
    conditions: Joi.string().required().min(3), 
    discount_applied: Joi.string().required(),
    normal_price: Joi.number().required().precision(2),
    discount_price: Joi.number().required().precision(2),
    offer_image: Joi.string().required(),
    end_date: Joi.date().required(),
    student_role_ids: Joi.array().items(Joi.number().integer()).optional()
})
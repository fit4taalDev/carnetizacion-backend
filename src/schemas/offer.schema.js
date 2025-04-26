import Joi from "joi";

export const OfferSchema = Joi.object({
    title: Joi.string().required().min(3),
    description: Joi.string().required(3),
    start_date: Joi.date().required(),
    end_date: Joi.date().required(),
})
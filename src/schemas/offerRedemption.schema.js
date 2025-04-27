import Joi from "joi";

export const OfferRedemptionSchema = Joi.object({
    offer_id: Joi.number().required()
})
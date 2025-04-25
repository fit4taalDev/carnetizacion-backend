import Joi from "joi";

export const establishmentSchema = Joi.object({
    fullname: Joi.string().required().min(3),
    phone_number: Joi.string().required(),
    email: Joi.string().email().required(),
    establishment_name: Joi.string().required().min(3), 
    establishment_address: Joi.string().required().min(3),
    establishment_id: Joi.string().required().min(5),
    establishment_role_id: Joi.number().valid(0, 1).required(),
    
})
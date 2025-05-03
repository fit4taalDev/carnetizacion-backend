import Joi from "joi";

export const studentSchema = Joi.object({
    fullname: Joi.string().required().min(3),
    student_id: Joi.string().required().min(5),
    phone_number: Joi.string().required(),
    address: Joi.string().required().min(3),
    student_role_id: Joi.number().valid(0, 1).required(),
    email: Joi.string().email().required(),
    qr_img: Joi.string().optional(),
    profile_photo: Joi.string().optional(),
    program_id:Joi.number().required(),
    birth_date: Joi.date().required(),
    active: Joi.boolean().required()
    
})
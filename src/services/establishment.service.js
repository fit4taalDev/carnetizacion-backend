
import { Users } from "../database/models/users.model.js";
import bcrypt from 'bcrypt'
import BaseService from "./base.service.js";
import { Establishments } from "../database/models/establishments.model.js";

class EstablishmentService extends BaseService{
    constructor(){
        super(Establishments)
    }

    async checkIfExistIn(model, field, value, message) {
        const existing = await model.findOne({ where: { [field]: value } });
        if (existing) {
            throw new Error(message);
        }
    }

    async createEstablishment(data){
        const genericPassword = data.establishment_id + "#"
        const userData = {
            email: data.email.toLowerCase(),
            password: await bcrypt.hash(genericPassword, 10),
            role_id: 1
        }
        await this.checkIfExistIn(Users, 'email', data.email, 'The email address is already registered');
        await this.checkIfExistIn(Establishments, 'establishment_name', data.establishment_name, 'The establishment name is already registered');
        await this.checkIfExistIn(Establishments, 'phone_number', data.phone_number, 'The phone number is already registered');
        await this.checkIfExistIn(Establishments, 'establishment_id', data.establishment_id, 'The establishment id is already registered');

        const newUser = await Users.create(userData)

        const newEstablishmentData = {...data,id:newUser.id ,user_id: newUser.id}

        return super.create(newEstablishmentData)
    }
    
}

export default EstablishmentService
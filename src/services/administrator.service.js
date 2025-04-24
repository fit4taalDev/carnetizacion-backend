import { Administrators } from "../database/models/administrators.model.js";
import { Users } from "../database/models/users.model.js";
import bcrypt from 'bcrypt'
import BaseService from "./base.service.js";

class AdministratoService extends BaseService{
    constructor(){
        super(Administrators)
    }

    async checkIfExistIn(model, field, value, message) {
        const existing = await model.findOne({ where: { [field]: value } });
        if (existing) {
            throw new Error(message);
        }
    }

    async createAdministrator(data){
        const userData = {
            email: data.email,
            password: await bcrypt.hash(data.password, 10),
            role_id: 0
        }
        await this.checkIfExistIn(Users, 'email', data.email, 'The email address is already registered');

        const newUser = await Users.create(userData)

        const newAdminData = {...data,id:newUser.id ,user_id: newUser.id}

        return super.create(newAdminData)
    }
    
}

export default AdministratoService
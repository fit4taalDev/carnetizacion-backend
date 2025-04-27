import { Administrators } from "../database/models/administrators.model.js";
import { Users } from "../database/models/users.model.js";
import bcrypt from 'bcrypt'
import BaseService from "./base.service.js";
import { sequelize } from "../database/sequelize.js";

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

    async createAdministrator(data) {
        return await sequelize.transaction(async (t) => {
            const userData = {
                email: data.email.toLowerCase(),
                password: await bcrypt.hash(data.password, 10),
                role_id: 0
            };

            await this.checkIfExistIn(Users, 'email', data.email, 'The email address is already registered', { transaction: t });
            await this.checkIfExistIn(Administrators, 'phone_number', data.phone_number, 'The phone number is already registered', { transaction: t });

            const newUser = await Users.create(userData, { transaction: t });

            const newAdminData = {
                ...data,
                id: newUser.id,
                user_id: newUser.id
            };

            const newAdmin = await Administrators.create(newAdminData, { transaction: t });

            return newAdmin;
        });
    }
    
}

export default AdministratoService
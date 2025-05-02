import BaseService from "./base.service.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Users } from "../database/models/users.model.js";
import { Roles } from "../database/models/roles.model.js";
import { Administrators } from "../database/models/administrators.model.js";
import { Students } from "../database/models/students.model.js";
import { Establishments } from "../database/models/establishments.model.js";

class AuthService extends BaseService{
    constructor(){
        super(Users)
    }

    async login(data){
        const user  = await this.model.findOne({
            where: {email: data.email.toLowerCase()},
            include: [
                { model: Roles,           attributes: ['id', 'name'] },
                { model: Administrators,  attributes: ['profile_photo', 'fullname']},
                { model: Students,        attributes: ['fullname', 'profile_photo']},
                { model: Establishments,  attributes: ['establishment_name', 'profile_photo']},
              ]
            });

        if(!user){
            throw { status: 401, message: 'Invalid credentials'};
        }

       const validPassword = await bcrypt.compare(data.password, user.password)
        if(!validPassword){
             throw { status: 401, message: 'Invalid credentials'};
        }

        const token = jwt.sign(
            {
              exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2, 
              id: user.id,
              role_id: user.role.id
            }, process.env.JWT_KEY);
        
        return {user, token}    
    }

    async checkUserExistsByEmail(data) {
        const user = await this.model.findOne({
          where: { email: data.email.toLowerCase() },
        });
      
        return !!user; 
    }

    async getUserByEmail(email){
        const user = await this.model.findOne({
            where: {email: email.toLowerCase()},
            include:{
                model: Roles,
                attribute: ["name"]
            }
        })

        if(!user){
            throw { status: 401, message: 'Invalid credentials'};
        }

        const token = jwt.sign(
            {
              exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2, 
              id: user.id,
              role_id: user.role.id
            }, process.env.JWT_KEY);
        
        return {user, token} 
    }
}

export default AuthService
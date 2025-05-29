import BaseService from "./base.service.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Users } from "../database/models/users.model.js";
import { Roles } from "../database/models/roles.model.js";
import { Administrators } from "../database/models/administrators.model.js";
import { Students } from "../database/models/students.model.js";
import { Establishments } from "../database/models/establishments.model.js";
import { randomBytes, createHash } from 'crypto';
import { Resend } from 'resend';
import { Op } from "sequelize";

class AuthService extends BaseService{
    constructor(){
        super(Users)
    }

    async login(data){
        const user  = await this.model.findOne({
            where: {email: data.email.toLowerCase()},
            include: [
                { model: Roles,           attributes: ['id', 'name', ] },
                { model: Administrators,  attributes: ['profile_photo', 'fullname']},
                { model: Students,        attributes: ['fullname', 'profile_photo', 'student_role_id']},
                { model: Establishments,  attributes: ['establishment_name', 'profile_photo', 'establishment_role_id']},
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

    async sendResetPasswordEmail(email ) {
        const user = await this.model.findOne({ where: { email: email.toLowerCase() } });
        if (!user) throw { status: 404, message: 'User not found' };

        const resetToken     = randomBytes(32).toString('hex');
        const resetTokenHash = createHash('sha256').update(resetToken).digest('hex');

        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        user.passwordResetToken   = resetTokenHash;
        user.passwordResetExpires = expiresAt;
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL_PASSWORD}/reset-password/${resetToken}`;

        const resend = new Resend(process.env.RESEND_API);

        await resend.emails.send({
        from:    'onboarding@resend.dev',
        to:      email,
        subject: '🔒 Reset your password',
        html:    `
            <p>Hello,</p>
            <p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>
            <p>If you did not request this, please ignore this email.</p>
        `
        });

        return { message: 'Reset mail sent' };
    }

    async resetPassword({ token, password }) {
        const tokenHash = createHash('sha256').update(token).digest('hex');

        const user = await Users.findOne({
        where: {
            passwordResetToken: tokenHash,
            passwordResetExpires: { [Op.gt]: new Date() }
        }
        });
        if (!user) {
        throw { status: 400, message: 'The time to reset your password has already passed.' };
        }

        user.password = await bcrypt.hash(password, 10);

        user.passwordResetToken   = null;
        user.passwordResetExpires = null;
        await user.save();

        return { message: 'Password successfully reset' };
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
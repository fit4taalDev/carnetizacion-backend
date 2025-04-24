
import { Users } from "../database/models/users.model.js";
import bcrypt from 'bcrypt'
import BaseService from "./base.service.js";
import { Students } from "../database/models/students.model.js";

class StudentService extends BaseService{
    constructor(){
        super(Students)
    }

    async checkIfExistIn(model, field, value, message) {
        const existing = await model.findOne({ where: { [field]: value } });
        if (existing) {
            throw new Error(message);
        }
    }

    async createStudent(data){
        const genericPassword = data.student_id + "#"
        const userData = {
            email: data.email,
            password: await bcrypt.hash(genericPassword, 10),
            role_id: 0
        }
        await this.checkIfExistIn(Users, 'email', data.email, 'The email address is already registered');

        const newUser = await Users.create(userData)

        const newStudentData = {...data,id:newUser.id ,user_id: newUser.id}

        return super.create(newStudentData)
    }
    
}

export default StudentService
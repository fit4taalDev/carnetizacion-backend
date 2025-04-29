import { Users } from "../database/models/users.model.js";
import { Students } from "../database/models/students.model.js";
import bcrypt from 'bcrypt';
import BaseService from "./base.service.js";
import { sequelize } from "../database/sequelize.js";
import { generateQRCode } from "../utils/generateQR.utils.js";
import { StudentRoles } from "../database/models/studentRoles.model.js";

class StudentService extends BaseService {
    constructor() {
        super(Students);
    }

    async checkIfExistIn(model, field, value, message, options = {}) {
        const existing = await model.findOne({ where: { [field]: value }, ...options });
        if (existing) {
            throw new Error(message);
        }
    }

    async createStudent(data) {
        return await sequelize.transaction(async (t) => {
            const genericPassword = data.student_id + "#";
            const userData = {
                email: data.email.toLowerCase(),
                password: await bcrypt.hash(genericPassword, 10),
                role_id: 2
            };

            await this.checkIfExistIn(Users, 'email', data.email, 'The email address is already registered', { transaction: t });
            await this.checkIfExistIn(Students, 'phone_number', data.phone_number, 'The phone number is already registered', { transaction: t });
            await this.checkIfExistIn(Students, 'student_id', data.student_id, 'The student_id is already registered', { transaction: t });

            const newUser = await Users.create(userData, { transaction: t });

            const qrCodeUrl = await generateQRCode(data.student_id);

            const newStudentData = {
                ...data,
                id: newUser.id,
                user_id: newUser.id,
                qr_img: qrCodeUrl,
            };

            const newStudent = await Students.create(newStudentData, { transaction: t });

            return newStudent;
        });
    }

    async findAllStudents(role) {
        const whereCondition = role ? {name:role} : undefined
        return this.model.findAll({
          include: [{
            model: Users,
            attributes: ['email'],
          },{
            model: StudentRoles,
            attributes: ["name"],
            where: whereCondition
          }],
          attributes: {
            exclude: ['user_id',  'student_role_id']
          }
        });
    }

    async findById(id){
        return this.model.findOne({
            where: {id:id},
            include: [{
                model: StudentRoles,
                attributes: ['name']
            },{
                model: Users,
                attributes: ['email'],
            }],
            attributes:{
                exclude: ['user_id']
            }
        })
    }
}

export default StudentService;

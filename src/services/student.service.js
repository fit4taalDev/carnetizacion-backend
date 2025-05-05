import { Users } from "../database/models/users.model.js";
import { Students } from "../database/models/students.model.js";
import bcrypt from 'bcrypt';
import BaseService from "./base.service.js";
import { sequelize } from "../database/sequelize.js";
import { generateQRCode } from "../utils/generateQR.utils.js";
import { StudentRoles } from "../database/models/studentRoles.model.js";
import { uploadImage } from "../utils/savePicture.js";
import { Programs } from "../database/models/programs.model.js";
import { Op } from 'sequelize';

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

    async createStudent(data, fileBuffer, fileMeta) {

        return sequelize.transaction(async (t) => {
          const genericPassword = data.student_id + '#';
          const userData = {
            email:    data.email.toLowerCase(),
            password: await bcrypt.hash(genericPassword, 10),
            role_id:  2
          };
    
          await this.checkIfExistIn(Users, 'email', data.email, 'The email address is already registered', { transaction: t });
          await this.checkIfExistIn( Students, 'phone_number', data.phone_number, 'The phone number is already registered', { transaction: t });
          await this.checkIfExistIn( Students, 'student_id', data.student_id, 'The student_id is already registered', { transaction: t });
    
          const newUser = await Users.create(userData, { transaction: t });
    
          const qrCodeUrl = await generateQRCode(data.student_id);

          let profilePath = null;
          if (fileBuffer && fileMeta) {
            profilePath = await uploadImage(fileBuffer, fileMeta);
          }
      
          const newStudentData = {
            ...data,
            id:newUser.id,
            user_id: newUser.id,
            qr_img: qrCodeUrl,
            profile_photo:profilePath 
          };
    
          const newStudent = await Students.create(newStudentData, { transaction: t });
          return newStudent;
        });
      }

    async findAllStudents(role, fullname, active, programId, dateFrom, dateTo) {
        const whereStudents = {}

        if (fullname) {
            whereStudents.fullname = { [Op.iLike]: `%${fullname}%` };
          }

        if (active === 'true') {
        whereStudents.active = true;
        } else if (active === 'false') {
        whereStudents.active = false;
        }
        if (programId !== undefined && !isNaN(programId)) {
            whereStudents.program_id = programId;
        }

        const studentRolesInclude = {
            model: StudentRoles,
            attributes: ['name'],
            ...(role
              ? { where: { name: role }, required: true }
              : { required: false })
        };

        if (dateFrom || dateTo) {
            whereStudents.createdAt = {};
            if (dateFrom) {
              whereStudents.createdAt[Op.gte] = new Date(dateFrom);
            }
            if (dateTo) {
              const end = new Date(dateTo);
              end.setHours(23, 59, 59, 999);
              whereStudents.createdAt[Op.lte] = end;
            }
          }
          
        
        return await Students.findAll({
            where: whereStudents,
            attributes: {
              include: [
                [
                  sequelize.literal(`(
                    SELECT COUNT(*)
                    FROM offer_redemptions AS ordr
                    WHERE ordr.student_id = "students"."id"
                  )`),
                  'offerRedemptionsCount'
                ]
              ],
              exclude: ['user_id', 'student_role_id', 'program_id']
            },
            include: [
              { model: Users, attributes: ['email'] },
              studentRolesInclude,
              {
                model: StudentRoles,
                attributes: ['name'],
              },
              {
                model: Programs,
                attributes: ['name'],
              }
            ]
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

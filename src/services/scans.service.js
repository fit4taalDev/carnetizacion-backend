import BaseService from "./base.service.js";
import { Scans } from "../database/models/scans.models.js";
import { Students } from "../database/models/students.model.js";
import { Establishments } from "../database/models/establishments.model.js";
import { Users } from "../database/models/users.model.js";

class ScanService extends BaseService{
    constructor(){
        super(Scans)
    }

    async create (data){
        const existingStudent = await Students.findOne({
            where:{student_id: data.student_id}
        })

        if (!existingStudent) {
            throw new Error('The student is not registered');
        }

        const existingEstablishment = await Establishments.findByPk(data.establishment_id);

        if (!existingEstablishment) {
            throw new Error('The establishment is not registered');
        }

        const scanInfo = {
            student_id: existingStudent.id,
            establishment_id: data.establishment_id,
            scanned_at: new Date()
        }

        return super.create(scanInfo)
    }

    async findAllScansByEstablishment(){
        return this.model.findAll({
            attributes:{
                exclude: ['student_id']
            } 
        })
    }

    async findAllScansByEstablishmentId(id){
        return this.model.findAll({
            where: {establishment_id:id},
            include: [
                {
                    model:Students,
                    include:[{
                        model:Users,
                        attributes:{
                            exclude:['id', 'password', 'createdAt', 'role_id']
                        }
                    }],
                    attributes:{
                        exclude: ['qr_img', 'profile_photo', 'user_id']
                    }
                },
            ],
            attributes:{
                exclude: ['student_id', 'establishment_id']
            }
        })
    }
    
    async findAllByEstudentId(id){
        return this.model.findAll({
            where: {student_id: id},
            include: [
                {
                    model:Establishments,
                    include:[{
                        model:Users,
                        attributes:{
                            exclude:['id', 'password', 'createdAt', 'role_id']
                        }
                    }],
                    attributes:{
                        exclude: ['qr_img','establishment_id','profile_img','user_id','createdAt']
                    }
                },
            ],
            attributes:{
                exclude: ['student_id', 'establishment_id']
            }
        })
    }
}

export default ScanService
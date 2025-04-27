import BaseService from "./base.service.js";
import { Scans } from "../database/models/scans.models.js";
import { Students } from "../database/models/students.model.js";
import { Establishments } from "../database/models/establishments.model.js";

class ScanService extends BaseService{
    constructor(){
        super(Scans)
    }

    async create (data){
        const existingStudent = await Students.findByPk(data.student_id);

        if (!existingStudent) {
            throw new Error('The student is not registered');
        }

        const existingEstablishment = await Establishments.findByPk(data.establishment_id);

        if (!existingEstablishment) {
            throw new Error('The establishment is not registered');
        }

        const scanInfo = {
            ...data,
            scanned_at: new Date()
        }

        return super.create(scanInfo)
    }

    
}

export default ScanService
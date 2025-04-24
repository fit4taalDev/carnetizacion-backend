import StudentService from "../services/student.service.js";

const service = new StudentService()

class StudentController{
    async createStudent (req, res, next){
        try{
            const body = req.body;
            const newStudent = await service.createStudent(body)
    
            return res.status(201).json({
                message:'Student successfully created',
                newStudent: newStudent
            })
        }catch (error) {
            next(error);
        }
    }
}

export default StudentController
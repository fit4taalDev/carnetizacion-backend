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

    async findAllStudents (req, res, next){
        try{
            const students = await service.findAllStudents()
            return res.status(200).json(students)
        }catch (error) {
            next(error);
        }
    }

    async findAllStudentById (req, res, next){
        const {id} = req.params
        try{
            const students = await service.findAllStudentById(id)
            return res.status(200).json(students)
        }catch (error) {
            next(error);
        }
    }
}

export default StudentController
import StudentService from "../services/student.service.js";
import multer from 'multer'; 
import { generateSignedUrl } from "../utils/savePicture.js";

const service = new StudentService()

class StudentController{
    async createStudent(req, res, next) {
        try {
          const data = req.body;
          const file = req.file;                             
          const fileBuffer = file ? file.buffer : null;            
          const fileMeta = file ? { filename: file.originalname, mimetype: file.mimetype } : null;
    
          const newStudent = await service.createStudent(data, fileBuffer,fileMeta);
    
          let profileUrl = null;
          if (newStudent.profile_photo) {
            profileUrl = await generateSignedUrl(newStudent.profile_photo, 60 * 60 ); // Valid for 1 hour
          }
    
          return res.status(201).json({
            message: 'Student successfully created',
            newStudent: {
              ...newStudent.get({ plain: true }),
              profile_photo: profileUrl
            }
          });
        } catch (err) {
          if (err instanceof multer.MulterError) {
            const msg = err.code === 'LIMIT_FILE_SIZE'
              ? 'The file must not be larger than 200 KB.'
              : err.code === 'LIMIT_UNEXPECTED_FILE'
                ? err.message
                : 'Error processing the image.';
            return res.status(400).json({ error: msg });
          }
          next(err);
        }
      }

    async findAllStudents (req, res, next){
        const role = req.query.role?.toString().trim()

        try{
            const students = await service.findAllStudents(role)
            return res.status(200).json(students)
        }catch (error) {
            next(error);
        }
    }

    async findAllStudentById (req, res, next){
        const {id} = req.params
        try{
            const students = await service.findById(id)
            return res.status(200).json(students)
        }catch (error) {
            next(error);
        }
    }
}

export default StudentController
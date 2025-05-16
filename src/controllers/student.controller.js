import StudentService from "../services/student.service.js";
import multer from 'multer'; 
import { generateSignedUrl } from "../utils/signedUrl.js";

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
            profileUrl = await generateSignedUrl(newStudent.profile_photo);
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

      async findAllStudents(req, res, next) {
        const role     = req.query.role     ? req.query.role.toString().trim()     : undefined;
        const fullname = req.query.fullname ? req.query.fullname.toString().trim() : undefined;

        const activeRaw = req.query.active;
        let active;
        if (activeRaw === 'true' || activeRaw === 'false') {
          active = activeRaw;
        }

        const programRaw = req.query.program_id ?? req.query.program;
        let program;
        if (programRaw !== undefined && programRaw !== '') {
          program = parseInt(programRaw.toString(), 10);
          if (isNaN(program)) {
            return res.status(400).json({ message: 'program_id debe ser un entero válido' });
          }
        }

        const dateFrom = req.query.dateFrom || req.query.date_from;
        const dateTo   = req.query.dateTo   || req.query.date_to;

        const page     = req.query.page     ? Math.max(1, parseInt(req.query.page, 10))     : 1;
        const pageSize = req.query.pageSize ? Math.max(1, parseInt(req.query.pageSize, 10)) : 10;

        try {
          const result = await service.findAllStudents(role, fullname, active, program, dateFrom, dateTo, page, pageSize);
          return res.status(200).json(result);
        } catch (error) {
          next(error);
        }
      }

    async findAllStudentById (req, res, next){
        const {id} = req.params
        const page     = req.query.page     ? Math.max(1, parseInt(req.query.page, 10))     : 1;
        const pageSize = req.query.pageSize ? Math.max(1, parseInt(req.query.pageSize, 10)) : 10;
        try{
            const students = await service.findById(id, page, pageSize)
            return res.status(200).json(students)
        }catch (error) {
            next(error);
        }
    }
}

export default StudentController
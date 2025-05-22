import express from 'express';
import administratorHandler from '../middlewares/administrator.handler.js';
import validatorHandler from '../middlewares/validator.handler.js';
import StudentController from '../controllers/student.controller.js';
import { studentSchema } from '../schemas/student.schema.js';
import { uploadImage } from '../middlewares/saveImage.controller.js';


const router = express.Router();
const controller = new StudentController()

router.post('/',
    validatorHandler(studentSchema),
    uploadImage('profile_photo'),
    administratorHandler,
    controller.createStudent
)

router.patch('/:id',
    validatorHandler(studentSchema),
    uploadImage('profile_photo'),
    administratorHandler,
    controller.updateStudent
)

router.get('/',
    administratorHandler,
    controller.findAllStudents
)

router.get('/:id',
    administratorHandler,
    controller.findAllStudentById
)

export default router
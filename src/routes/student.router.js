import express from 'express';
import administratorHandler from '../middlewares/administrator.handler.js';
import validatorHandler from '../middlewares/validator.handler.js';
import StudentController from '../controllers/student.controller.js';
import { studentSchema } from '../schemas/student.schema.js';

const router = express.Router();
const controller = new StudentController()

router.post('/',
    validatorHandler(studentSchema),
    administratorHandler,
    controller.createStudent
)

export default router
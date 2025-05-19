import express from 'express';
import ProfileController from '../controllers/profile.controller.js';
import administratorHandler from '../middlewares/administrator.handler.js';
import { uploadImage } from '../middlewares/saveImage.controller.js';
import allRolesHandler from '../middlewares/allRoles.handler.js';
import establishmentHandler from '../middlewares/establishment.handler.js';
import studentHandler from '../middlewares/student.handler.js';

const router = express.Router();
const controller = new ProfileController()

router.get('/',
    allRolesHandler,
    controller.findProfile
)

router.patch('/admin',
    uploadImage('profile_photo'),
    administratorHandler,
    controller.updateAdminProfile
)

router.patch('/establishment',
    uploadImage('profile_photo'),
    establishmentHandler,
    controller.updateEstablishmentProfile
)

router.patch('/student',
    uploadImage('profile_photo'),
    studentHandler,
    controller.updateStudentProfile
)


export default router
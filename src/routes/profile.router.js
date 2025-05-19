import express from 'express';
import ProfileController from '../controllers/profile.controller.js';
import administratorHandler from '../middlewares/administrator.handler.js';
import { uploadImage } from '../middlewares/saveImage.controller.js';

const router = express.Router();
const controller = new ProfileController()

router.get('/',
    administratorHandler,
    controller.findProfile
)

router.patch('/admin',
    uploadImage('profile_photo'),
    administratorHandler,
    controller.updateAdminProfile
)

export default router
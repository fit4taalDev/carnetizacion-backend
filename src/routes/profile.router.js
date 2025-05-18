import express from 'express';
import ProfileController from '../controllers/profile.controller.js';
import administratorHandler from '../middlewares/administrator.handler.js';

const router = express.Router();
const controller = new ProfileController()

router.get('/',
    administratorHandler,
    controller.findProfile
)

export default router
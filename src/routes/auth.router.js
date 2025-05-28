import express from 'express';
import validatorHandler from '../middlewares/validator.handler.js';
import { loginSchema } from '../schemas/auth.schema.js';
import AuthController from '../controllers/auth.controller.js';
import { resetPaswordEmailSchema } from '../schemas/resetPasswordEmail.schema.js';

const router = express.Router();

const controller = new AuthController()

router.post('/login', 
    validatorHandler(loginSchema),
    controller.login
)

router.post('/login-email', 
    controller.checkUserExistsByEmail
)

router.post('/user-by-email',
    controller.getUserByEmail
)

router.post('/forgot-password',
    validatorHandler(resetPaswordEmailSchema),
    controller.forgotPassword
)

export default router
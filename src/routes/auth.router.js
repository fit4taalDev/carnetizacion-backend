import express from 'express';
import validatorHandler from '../middlewares/validator.handler.js';
import { loginSchema } from '../schemas/auth.schema.js';
import { loginController } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', 
    validatorHandler(loginSchema),
    loginController
)

export default router
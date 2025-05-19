import express from 'express';
import allRolesHandler from '../middlewares/allRoles.handler.js';
import PasswordController from '../controllers/password.controller.js';
import { PasswordSchema } from '../schemas/password.schema.js';
import validatorHandler from '../middlewares/validator.handler.js';

const router = express.Router();
const controller = new PasswordController()

router.patch('/',
    allRolesHandler,
    validatorHandler(PasswordSchema),
    controller.updatePassword
)

export default router
import express from 'express';
import { administratorSchema } from '../schemas/administrator.schema.js';
import administratorHandler from '../middlewares/administrator.handler.js';
import AdministratorController from '../controllers/administrator.controller.js';
import validatorHandler from '../middlewares/validator.handler.js';

const router = express.Router();
const controller = new AdministratorController()

router.post('/',
    validatorHandler(administratorSchema),
    administratorHandler,
    controller.createAdministrator
)

export default router
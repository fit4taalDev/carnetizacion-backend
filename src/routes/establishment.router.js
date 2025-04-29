import express from 'express';
import EstablishmentController from "../controllers/establishment.controller.js";
import validatorHandler from '../middlewares/validator.handler.js';
import administratorHandler from '../middlewares/administrator.handler.js';
import { establishmentSchema } from '../schemas/establishment.schema.js';

const router = express.Router();
const controller = new EstablishmentController()

router.post('/',
    validatorHandler(establishmentSchema),
    administratorHandler,
    controller.createEstablishment
)

router.get('/',
    administratorHandler,
    controller.findAllEstablishments
)

export default router
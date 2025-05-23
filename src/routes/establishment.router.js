import express from 'express';
import EstablishmentController from "../controllers/establishment.controller.js";
import validatorHandler from '../middlewares/validator.handler.js';
import administratorHandler from '../middlewares/administrator.handler.js';
import { establishmentSchema } from '../schemas/establishment.schema.js';
import { uploadImage } from '../middlewares/saveImage.controller.js';
import studentHandler from '../middlewares/studentHandler.js';

const router = express.Router();
const controller = new EstablishmentController()

router.post('/',
    validatorHandler(establishmentSchema),
    uploadImage('profile_photo'),
    administratorHandler,
    controller.createEstablishment
)

router.patch('/:id',
    validatorHandler(establishmentSchema),
    uploadImage('profile_photo'),
    administratorHandler,
    controller.updateEstablishment
)

router.get('/',
    administratorHandler,
    controller.findAllEstablishments
)

router.get('/student',
    studentHandler,
    controller.findAllEstablishmentStudent
)

router.get('/student/:id',
    studentHandler,
    controller.findEstablishmentByIdStudent
)

router.get('/:id',
    administratorHandler,
    controller.findEstablishmentById
)

router.get('/student',
    controller.findAllEstablishmentStudent
)

export default router
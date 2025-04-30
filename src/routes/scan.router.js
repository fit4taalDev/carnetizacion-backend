import express from 'express';
import validatorHandler from '../middlewares/validator.handler.js';
import ScanController from '../controllers/scan.controller.js';
import { scanSchema } from '../schemas/scan.schema.js';
import establishmentHandler from '../middlewares/establishment.handler.js';
import administratorHandler from '../middlewares/administrator.handler.js';

const router = express.Router();
const controller = new ScanController()

router.post('/',
    validatorHandler(scanSchema),
    establishmentHandler,
    controller.create
)

router.get('/',
    establishmentHandler,
    controller.findAllByEstablishment
)

router.get('/:id',
    administratorHandler,
    controller.findAllByEstablishmentId
)

export default router
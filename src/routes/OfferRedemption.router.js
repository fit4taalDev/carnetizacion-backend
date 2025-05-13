import express from 'express';
import validatorHandler from '../middlewares/validator.handler.js';
import { OfferRedemptionSchema } from '../schemas/offerRedemption.schema.js';
import studentHandler from '../middlewares/student.handler.js';
import OfferRedemptionController from '../controllers/offerRedemption.controller.js';
import establishmentHandler from '../middlewares/establishment.handler.js';

const router = express.Router();
const controller = new OfferRedemptionController()

router.post('/',
    validatorHandler(OfferRedemptionSchema),
    studentHandler,
    controller.create
)

router.get('/establishment',
    establishmentHandler,
    controller.getOfferRedemptionByEstablihsment
)

router.get('/establishment/student/:id',
    establishmentHandler,
    controller.getOfferRedemptionByStudentIdEstablishment
)

router.get('/student',
    studentHandler,
    controller.findByStudent
)

export default router
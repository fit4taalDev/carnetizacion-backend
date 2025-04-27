import express from 'express';
import validatorHandler from '../middlewares/validator.handler.js';
import { OfferRedemptionSchema } from '../schemas/offerRedemption.schema.js';
import studentHandler from '../middlewares/student.handler.js';
import OfferRedemptionController from '../controllers/offerRedemption.controller.js';

const router = express.Router();
const controller = new OfferRedemptionController()

router.post('/',
    validatorHandler(OfferRedemptionSchema),
    studentHandler,
    controller.create
)

export default router
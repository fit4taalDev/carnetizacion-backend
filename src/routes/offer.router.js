import express from 'express';
import validatorHandler from '../middlewares/validator.handler.js';
import establishmentHandler from '../middlewares/establishment.handler.js';
import { OfferSchema } from '../schemas/offer.schema.js';
import OfferController from '../controllers/offer.controller.js';
import adminAndEstabHandler from '../middlewares/adminAndEstab.handler.js';

const router = express.Router();
const controller = new OfferController()

router.post('/',
    validatorHandler(OfferSchema),
    establishmentHandler,
    controller.createOffer
)

router.get('/',
    adminAndEstabHandler,
    controller.findAllOffers
)

export default router
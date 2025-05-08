import express from 'express';
import validatorHandler from '../middlewares/validator.handler.js';
import establishmentHandler from '../middlewares/establishment.handler.js';
import { OfferSchema } from '../schemas/offer.schema.js';
import OfferController from '../controllers/offer.controller.js';
import adminAndEstabHandler from '../middlewares/adminAndEstab.handler.js';
import allRolesHandler from '../middlewares/allRoles.handler.js';
import { uploadImage } from '../middlewares/saveImage.controller.js';

const router = express.Router();
const controller = new OfferController()

router.post('/',
    validatorHandler(OfferSchema),
    uploadImage('offer_image'),
    establishmentHandler,
    controller.createOffer
)

router.get('/',
    adminAndEstabHandler,
    controller.findAllOffers
)

router.get('/:id',
    allRolesHandler,
    controller.findOfferById
)

export default router
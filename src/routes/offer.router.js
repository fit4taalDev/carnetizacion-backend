import express from 'express';
import validatorHandler from '../middlewares/validator.handler.js';
import establishmentHandler from '../middlewares/establishment.handler.js';
import { OfferSchema } from '../schemas/offer.schema.js';
import OfferController from '../controllers/offer.controller.js';
import adminAndEstabHandler from '../middlewares/adminAndEstab.handler.js';
import allRolesHandler from '../middlewares/allRoles.handler.js';
import { uploadImage } from '../middlewares/saveImage.controller.js';
import administratorHandler from '../middlewares/administrator.handler.js';

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

router.get('/establishment',
    establishmentHandler,
    controller.findAllByEstablishment
)

router.get('/:id',
    allRolesHandler,
    controller.findOfferById
)

router.get('/establishment/:id',
    administratorHandler,
    controller.findAllOffersByEstablishmentId
)

router.put('/:id',
    validatorHandler(OfferSchema),
    uploadImage('offer_image'),
    establishmentHandler,
    controller.updateOffer
)

router.patch('/:id/active',
    establishmentHandler,
    controller.updateActive
)

export default router
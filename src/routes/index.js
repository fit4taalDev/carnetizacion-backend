import express from 'express';
import authRouter from './auth.router.js'
import administratorRouter from './administrator.router.js'
import studentRouter from './student.router.js'
import establishmentRouter from './establishment.router.js'
import offerRouter from './offer.router.js'
import offerRedemptionRouter from './OfferRedemption.router.js'

export function routerApi(app){
    const router = express.Router()
    app.use('/api/v1', router);
    router.use('/auth', authRouter);
    router.use('/administrator', administratorRouter);
    router.use('/student', studentRouter);
    router.use('/establishment', establishmentRouter)
    router.use('/offer', offerRouter)
    router.use('/offer-redemption', offerRedemptionRouter)
}
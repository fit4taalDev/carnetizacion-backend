import express from 'express';
import authRouter from './auth.router.js'
import administratorRouter from './administrator.router.js'
import studentRouter from './student.router.js'
import establishmentRouter from './establishment.router.js'
import offerRouter from './offer.router.js'
import offerRedemptionRouter from './OfferRedemption.router.js'
import scanRouter from './scan.router.js'
import profileRouter from './profile.router.js'
import passwordRouter from './password.router.js'

export function routerApi(app){
    const router = express.Router()
    app.use('/api/v1', router);
    router.use('/auth', authRouter);
    router.use('/administrator', administratorRouter);
    router.use('/student', studentRouter);
    router.use('/establishment', establishmentRouter)
    router.use('/offer', offerRouter)
    router.use('/offer-redemption', offerRedemptionRouter)
    router.use('/scan', scanRouter)
    router.use('/profile', profileRouter)
    router.use('/password', passwordRouter)

} 
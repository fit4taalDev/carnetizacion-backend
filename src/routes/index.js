import express from 'express';
import authRouter from './auth.router.js'
import administratorRouter from './administrator.router.js'

export function routerApi(app){
    const router = express.Router()
    app.use('/api/v1', router);
    router.use('/auth', authRouter)
    router.use('/administrator', administratorRouter)
}
import express from 'express';
import { sequelize } from './database/sequelize.js';
import dotenv from 'dotenv';
import './database/models/index.js'
import { routerApi } from './routes/index.js';
import errorHandler from './middlewares/error.handler.js';
import cloudinary from '../cloudinaryConfig.js';

dotenv.config();

const app = express()
const PORT  = process.env.PORT || 3000;

app.use(express.json());

routerApi(app);

app.use(errorHandler);

const main = async () => {
    try{
        app.listen(PORT, async() => {
            await sequelize.sync({alter: true});
            console.log('Database connected');
            console.log(`Server is running on http://localhost:${PORT}`)
        })
    }catch(error){
        console.log(error)
    }
}

main()
import EstablishmentService from "../services/establishment.service.js";

const service = new EstablishmentService()

class EstablishmentController{
    async createEstablishment (req, res, next){
        try{
            const body = req.body;
            const newEstablishment = await service.createEstablishment(body)
    
            return res.status(201).json({
                message:'Establishment successfully created',
                newEstablishment: newEstablishment
            })
        }catch (error) {
            next(error);
        }
    }

    async findAllEstablishments (req, res, next){
        try{
            const establishments = await service.findAllEstablishments()
            return res.status(200).json(establishments)
        }catch (error) {
            next(error);
        }
    }
}

export default EstablishmentController
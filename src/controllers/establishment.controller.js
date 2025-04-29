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
            const role = req.query.role?.toString().trim()

            const establishments = await service.findAllEstablishments(role)
            return res.status(200).json(establishments)
        }catch (error) {
            next(error);
        }
    }

    async findEstablishmentById (req, res, next){
        const {id} = req.params
        try{
            const establishment = await service.findById(id)
            return res.status(200).json(establishment)
        }catch (error) {
            next(error);
        }
    }
}

export default EstablishmentController
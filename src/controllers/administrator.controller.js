import AdministratoService from "../services/administrator.service.js";

const service = new AdministratoService()

class AdministratorController{
    async createAdministrator (req, res, next){
        try{
            const body = req.body;
            const newAdministrator = await service.createAdministrator(body)
    
            return res.status(201).json({
                message:'Administrator successfully created',
                newAdministrator: newAdministrator
            })
        }catch (error) {
            next(error);
        }
    }
}

export default AdministratorController
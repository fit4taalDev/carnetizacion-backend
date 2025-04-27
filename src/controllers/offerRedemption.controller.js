import OfferRedemptionService from "../services/offerRedemption.service.js";

const service = new OfferRedemptionService()

class OfferRedemptionController{
    async create(req, res, next){
        try{
            const body = req.body;
            const student_id = req.user.id
            const data = {...body, student_id:student_id}
            const newOfferRedemption = await service.create(data)
    
            return res.status(201).json({
                message:'Offer redemption successfully created',
                newOfferRedemption: newOfferRedemption
            })
        }catch (error) {
            next(error);
        }
    }
}

export default OfferRedemptionController
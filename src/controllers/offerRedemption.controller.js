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

    async getOfferRedemptionByEstablihsment(req, res, next){
        try{
            const establishmentId = req.user.id 
            const search = req.query.search?.toString().trim()  
            const role = req.query.role?.toString().trim()
            const redemptionDate = req.query.redemptionDate?.toString().trim();
            const dateFrom = req.query.dateFrom || req.query.date_from;
            const dateTo = req.query.dateTo   || req.query.date_to;

            const offersRemptions = await service.findAllOffersByEstablishment(establishmentId,search, role, redemptionDate, dateFrom, dateTo);
            return res.status(200).json(offersRemptions)
        }catch (error) {
            next(error);
        }
    }

    async getOfferRedemptionByStudentIdEstablishment(req, res, next){
        try{
            const establishmentId = req.user.id 
            const student_id = req.params.id
            const page = req.query.page
            const pageSize = req.query.pageSize
        
            const offerRedemptionByStudentIdEstablishment = await service.findAllOfferRedemptionByStudentIdEstablihsment(student_id, establishmentId, page, pageSize)
            return res.status(200).json(offerRedemptionByStudentIdEstablishment)
        }catch (error) {
            next(error);
        }
    }
}

export default OfferRedemptionController
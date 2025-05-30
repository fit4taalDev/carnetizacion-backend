import OfferRedemptionService from "../services/offerRedemption.service.js";

const service = new OfferRedemptionService()

class OfferRedemptionController{
    async create(req, res, next){
        try{
            const body = req.body;
            const student_id = req.user.id
            const data = {...body, student_id:student_id}
            const newOfferRedemption = await service.createOfferRedemption(data)
            
    
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
            const page     = req.query.page     ? Math.max(1, parseInt(req.query.page, 10))     : 1;
            const pageSize = req.query.pageSize ? Math.max(1, parseInt(req.query.pageSize, 10)) : 10;

            const offersRemptions = await service.findAllOffersByEstablishment(establishmentId,search, role, redemptionDate, dateFrom, dateTo, page, pageSize);
            return res.status(200).json(offersRemptions)
        }catch (error) {
            next(error);
        }
    }

    async getOfferRedemptionByStudentIdEstablishment(req, res, next){
        try{
            const establishmentId = req.user.id 
            const student_id = req.params.id
            const page     = req.query.page     ? Math.max(1, parseInt(req.query.page, 10))     : 1;
            const pageSize = req.query.pageSize ? Math.max(1, parseInt(req.query.pageSize, 10)) : 10;
        
            const offerRedemptionByStudentIdEstablishment = await service.findAllOfferRedemptionByStudentIdEstablihsment(student_id, establishmentId, page, pageSize)
            return res.status(200).json(offerRedemptionByStudentIdEstablishment)
        }catch (error) {
            next(error);
        }
    }

    async findByStudent(req, res, next){
        try {
            const student_id = req.user.id
            const page     = req.query.page     ? Math.max(1, parseInt(req.query.page, 10))     : 1;
            const pageSize = req.query.pageSize ? Math.max(1, parseInt(req.query.pageSize, 10)) : 10;

            const result = await service.findAllOffersRedemptionsByStudent(
                student_id,
                page,
                pageSize
            )
            return res.status(200).json(result)
        }catch (error) {
            next(error);
        }
    }
}

export default OfferRedemptionController
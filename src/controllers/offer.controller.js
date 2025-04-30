import OffersService from "../services/offers.service.js";
const service = new OffersService()

class OfferController{
    async createOffer(req, res, next){
        try{
            const body = req.body;
            const establishment_id = req.user.id
            const data = {...body, establishment_id:establishment_id}
            const newOffer = await service.create(data)
    
            return res.status(201).json({
                message:'Offer successfully created',
                newOffer: newOffer
            })
        }catch (error) {
            next(error);
        }
    }

    async findAllOffers (req, res, next) {
        const role = req.query.role?.toString().trim()
        try{
            const offers = await service.findAll(role)
            return res.status(200).json(offers)

        }catch (error) {
            next(error);
        }
    }

    async findOfferById (req, res, next){
        const {id} = req.params
        try{
            const offer = await service.findById(id)
            return res.status(200).json(offer)
        }catch (error) {
            next(error);
        }
    }
}

export default OfferController
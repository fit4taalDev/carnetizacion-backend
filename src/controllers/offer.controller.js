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
        try{
            const offers = await service.findAll()
            return res.status(200).json(offers)

        }catch (error) {
            next(error);
        }
    }
}

export default OfferController
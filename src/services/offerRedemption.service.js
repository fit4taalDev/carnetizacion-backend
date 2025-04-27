import BaseService from "./base.service.js";
import { OfferRedemptions } from "../database/models/offerRedemptions.js";

class OfferRedemptionService extends BaseService{
    constructor(){
        super(OfferRedemptions)
    }

    async createEstablishment(data){
        return super.create(data)
    }
    
}

export default OfferRedemptionService
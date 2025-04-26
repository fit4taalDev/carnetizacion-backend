import BaseService from "./base.service.js";
import { Offers } from "../database/models/offers.model.js";

class OffersService extends BaseService{
    constructor(){
        super(Offers)
    }

    async create(data){

        return super.create(data)
    }
    
}

export default OffersService
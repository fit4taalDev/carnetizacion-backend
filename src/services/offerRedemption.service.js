import BaseService from "./base.service.js";
import { OfferRedemptions } from "../database/models/offerRedemptions.js";
import { Students } from "../database/models/students.model.js";
import { Offers } from "../database/models/offers.model.js";
import { Establishments } from "../database/models/establishments.model.js";
import { Op } from "sequelize";

class OfferRedemptionService extends BaseService{
    constructor(){
        super(OfferRedemptions)
    }

    async createEstablishment(data){
        return super.create(data)
    }

    async findAllOffersByEstablishment(establishment_id, search, role, redemptionDate, dateFrom, dateTo){
    const whereRedemptions = {};
    const offerWhere  = { establishment_id };

    if (search) {
        const num = Number(search);
        if (!isNaN(num)) {
        whereRedemptions.offer_id = num;
        } else {
        offerWhere.title = { [Op.iLike]: `%${search}%` };
        }
    }


    let studentRoleId;
    if (role === 'Standard') studentRoleId = 0;
    else if (role === 'Premium') studentRoleId = 1;

    let order = [];

    if (redemptionDate === 'soon') {
    order = [['createdAt', 'DESC']];
    } else if (redemptionDate === 'far') {
    order = [['createdAt', 'ASC']];
    }

    if (dateFrom || dateTo) {
    whereRedemptions.createdAt = {};
    if (dateFrom) {
      whereRedemptions.createdAt[Op.gte] = new Date(dateFrom);
    }
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      whereRedemptions.createdAt[Op.lte] = end;
    }
  }

    const offersRedemptions = await OfferRedemptions.findAll({
        where: whereRedemptions,
        include: [
            {
                model: Students,
                attributes: ['student_id', 'student_role_id'],
                ...(studentRoleId !== undefined
                ? { where: { student_role_id: studentRoleId }, required: true }
                : {})
            },
            {
                model: Offers,
                where: offerWhere,
                attributes: ['title']
            }
        ],
        order
    });

    return offersRedemptions
    }
    
}

export default OfferRedemptionService
import BaseService from "./base.service.js";
import { OfferRedemptions } from "../database/models/offerRedemptions.js";
import { Students } from "../database/models/students.model.js";
import { Offers } from "../database/models/offers.model.js";
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
                attributes: ['student_id', 'student_role_id','id'],
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

    async findAllOfferRedemptionByStudentIdEstablihsment(student_id, establishment_id, page = 1 , pageSize = 10){
    const offset = (page - 1) * pageSize;

    const { count: totalCouponsUsed, rows: redemptions } =
        await OfferRedemptions.findAndCountAll({
        where: { student_id },
        include: [
            {
            model: Offers,
            where: { establishment_id },
            attributes: ['id', 'title', 'end_date','normal_price','discount_price']
            },
            {
            model: Students,
            attributes: ['student_id', 'student_role_id','id']
            }
        ],
        order: [['createdAt', 'DESC']],
        limit:  pageSize,
        offset,
        distinct: true
        });

    const now          = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const couponsThisMonth = await OfferRedemptions.count({
        where: {
        student_id,
        createdAt: { [Op.gte]: startOfMonth }
        },
        include: [
        {
            model: Offers,
            where: { establishment_id },
            attributes: []
        }
        ],
        distinct: true
    });

    const redeemedIds = redemptions.map(r => r.offer_id);
    const soonLimit = new Date(now);
    soonLimit.setDate(now.getDate() + 7);
    soonLimit.setHours(23, 59, 59, 999);

    const discountsAboutToExpire = await Offers.count({
        where: {
        establishment_id,
        end_date: { [Op.between]: [now, soonLimit] },
        ...(redeemedIds.length && { id: { [Op.notIn]: redeemedIds } })
        }
    });

    const totalPages = Math.ceil(totalCouponsUsed / pageSize);

    return {
        redemptions,             
        totalCouponsUsed,         
        couponsThisMonth,         
        discountsAboutToExpire,   
        pagination: {
        page,
        pageSize,
        totalPages,
        totalItems: totalCouponsUsed
        }
    };
    }
    
}

export default OfferRedemptionService
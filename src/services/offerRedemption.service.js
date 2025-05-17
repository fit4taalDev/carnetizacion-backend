import BaseService from "./base.service.js";
import { OfferRedemptions } from "../database/models/offerRedemptions.js";
import { Students } from "../database/models/students.model.js";
import { Offers } from "../database/models/offers.model.js";
import { Op, QueryTypes, where } from "sequelize";
import { StudentRoles } from "../database/models/studentRoles.model.js";
import { sequelize } from "../database/sequelize.js";
import { Establishments } from "../database/models/establishments.model.js";

class OfferRedemptionService extends BaseService{
    constructor(){
        super(OfferRedemptions)
    }

async createOfferRedemption({ student_id, offer_id }) {
    const student = await Students.findByPk(student_id)
    if (!student) {
      const err = new Error('Student not found')
      err.status = 404
      throw err
    }

    const offer = await Offers.findByPk(offer_id)
    if (!offer) {
      const err = new Error('Offer not found')
      err.status = 404
      throw err
    }

    if (!offer.active) {
      const err = new Error('Offer is not active')
      err.status = 400
      throw err
    }

    if (new Date(offer.end_date) < new Date()) {
      const err = new Error('Offer has expired')
      err.status = 400
      throw err
    }

    const rows = await sequelize.query(
      `SELECT 1
       FROM offer_student_role
       WHERE offer_id = :offer_id
         AND student_role_id = :role_id
       LIMIT 1`,
      {
        replacements: {
          offer_id,
          role_id: student.student_role_id
        },
        type: QueryTypes.SELECT
      }
    )
    if (rows.length === 0) {
      const err = new Error('You are not eligible to redeem this offer')
      err.status = 403
      throw err
    }

    const existing = await OfferRedemptions.findOne({
      where: { student_id, offer_id }
    })
    if (existing) {
      const err = new Error('Offer already redeemed by this student')
      err.status = 400
      throw err
    }

    return super.create({ student_id, offer_id })
  }

  async findAllOffersByEstablishment(establishment_id, search, role, redemptionDate, dateFrom, dateTo, page = 1, pageSize = 10) {
      const offset = (page - 1) * pageSize;
      const whereRedemptions = {};
      const offerWhere = { establishment_id };
      if (search) {
        const num = Number(search);
        if (!isNaN(num)) whereRedemptions.offer_id = num;
        else offerWhere.title = { [Op.iLike]: `%${search}%` };
      }
      let studentRoleId;
      if (role === 'Standard') studentRoleId = 0;
      else if (role === 'Premium') studentRoleId = 1;
      let order = [];
      if (redemptionDate === 'soon') order = [['createdAt','DESC']];
      else if (redemptionDate === 'far') order = [['createdAt','ASC']];
      if (dateFrom || dateTo) {
        whereRedemptions.createdAt = {};
        if (dateFrom) whereRedemptions.createdAt[Op.gte] = new Date(dateFrom);
        if (dateTo) {
          const end = new Date(dateTo);
          end.setHours(23,59,59,999);
          whereRedemptions.createdAt[Op.lte] = end;
        }
      }
      const { count: totalItems, rows } = await OfferRedemptions.findAndCountAll({
        where: whereRedemptions,
        include: [
          { model: Students, attributes: ['student_id','student_role_id','id'], ...(studentRoleId !== undefined ? { where: { student_role_id: studentRoleId }, required: true } : {}) },
          { model: Offers, where: offerWhere, attributes: ['title'] }
        ],
        order,
        limit: pageSize,
        offset
      });
      const data = rows.map(r => r.get({ plain: true }));
      return { data, pagination: { page, pageSize, totalPages: Math.ceil(totalItems / pageSize), totalItems } };
    }

async findAllOfferRedemptionByStudentIdEstablihsment(student_id, establishment_id, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  const { count: totalCouponsUsed, rows } = await OfferRedemptions.findAndCountAll({
    where: { student_id },
    include: [
      { model: Students, as: 'student', attributes: ['student_id','student_role_id','id'] },
      { model: Offers, as: 'offer', where: { establishment_id }, attributes: ['id','title','end_date','normal_price','discount_price'] }
    ],
    order: [['createdAt','DESC']],
    limit: pageSize,
    offset,
    distinct: true
  });
  const redemptions = rows.map(r => r.get({ plain: true }));
  const studentIdModel = redemptions.length ? redemptions[0].student.student_id : null;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const couponsThisMonth = await OfferRedemptions.count({
    where: { student_id, createdAt: { [Op.gte]: startOfMonth } },
    include: [{ model: Offers, as: 'offer', where: { establishment_id }, attributes: [] }],
    distinct: true
  });
  const redeemedIds = rows.map(r => r.offer_id);
  const soonLimit = new Date(now); soonLimit.setDate(now.getDate()+7); soonLimit.setHours(23,59,59,999);
  const discountsAboutToExpire = await Offers.count({
    where: { establishment_id, end_date: { [Op.between]: [now, soonLimit] }, ...(redeemedIds.length && { id: { [Op.notIn]: redeemedIds } }) }
  });
  const totalPages = Math.ceil(totalCouponsUsed / pageSize);
  return {
    student_id: studentIdModel,
    redemptions,
    totalCouponsUsed,
    couponsThisMonth,
    discountsAboutToExpire,
    pagination: { page, pageSize, totalPages, totalItems: totalCouponsUsed }
  };
}

    
async findAllOffersRedemptionsByStudent(student_id, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  const { count: totalOfferRedemptions, rows } = await this.model.findAndCountAll({
    where: { student_id },
    distinct: true,
    limit: pageSize,
    offset,
    order: [['createdAt', 'DESC']],
    include: [{
      model: Offers,
      as: 'offer',
      attributes: ['title','normal_price','discount_price','establishment_id'],
      include: [{
        model: Establishments,
        as: 'establishment',
        attributes: ['establishment_name']
      }]
    }]
  });

  const [{ total_saved }] = await sequelize.query(
    `SELECT COALESCE(SUM(o.normal_price - o.discount_price),0) AS total_saved
     FROM offer_redemptions r
     JOIN offers o ON o.id = r.offer_id
     WHERE r.student_id = :student_id`,
    { replacements: { student_id }, type: QueryTypes.SELECT }
  );
  const totalSaved = parseFloat(total_saved);

  const data = rows.map(r => r.get({ plain: true }));
  const totalPages = Math.ceil(totalOfferRedemptions / pageSize);

  return {
    totalOfferRedemptions,
    totalSaved,
    data,
    pagination: {
      page,
      pageSize,
      totalItems: totalOfferRedemptions,
      totalPages
    }
  };
}


}

export default OfferRedemptionService
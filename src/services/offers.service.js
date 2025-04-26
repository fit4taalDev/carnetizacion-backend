import BaseService from "./base.service.js";
import { Offers } from "../database/models/offers.model.js";
import { sequelize } from "../database/sequelize.js";

class OffersService extends BaseService {
  constructor() {
    super(Offers);
  }

  async create(data) {
    const { student_role_ids, ...offerData } = data;

    const offer = await super.create(offerData);

    if (student_role_ids && student_role_ids.length > 0) {
      const offerStudentRoles = student_role_ids.map(role_id => ({
        offer_id: offer.id,
        student_role_id: role_id
      }));

      await sequelize.models.offer_student_role.bulkCreate(offerStudentRoles);
    }

    return offer;
  }
}

export default OffersService;

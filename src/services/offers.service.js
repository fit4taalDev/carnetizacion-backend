import BaseService from "./base.service.js";
import { Offers } from "../database/models/offers.model.js";
import { sequelize } from "../database/sequelize.js";
import { StudentRoles } from "../database/models/studentRoles.model.js";

class OffersService extends BaseService {
  constructor() {
    super(Offers);
  }

  async create(data) {
    let { student_role_ids, ...offerData } = data;

    const offer = await super.create(offerData);

    if (!student_role_ids || student_role_ids.length === 0) {
      const allRoles = await StudentRoles.findAll();
      student_role_ids = allRoles.map(role => role.id);
    }
  
    const offerStudentRoles = student_role_ids.map(role_id => ({
      offer_id: offer.id,
      student_role_id: role_id
    }));
  
    await sequelize.models.offer_student_role.bulkCreate(offerStudentRoles);

    return offer;
  }

  async findAll(role){
    const whereCondition = role?.length ? {name:role} : undefined
    
    return this.model.findAll({
      include: [
        {
          model: StudentRoles,
          as: 'student_roles',
          through: { attributes: [] },
          required: !!role?.length,
          where: whereCondition
        }
      ]
    })
  }
}

export default OffersService;

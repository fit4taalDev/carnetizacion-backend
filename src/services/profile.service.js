import { Administrators } from "../database/models/administrators.model.js";
import { Establishments } from "../database/models/establishments.model.js";
import { Students } from "../database/models/students.model.js";
import { Users } from "../database/models/users.model.js";
import BaseService from "./base.service.js";

const ROLE = {
  ADMIN:         0,
  ESTABLISHMENT: 1,
  STUDENT:       2
}

export default class ProfileService extends BaseService {
  constructor() {
    super(Users)
  }

  async findProfile(user) {
    const include = []
    switch (user.role_id) {
      case ROLE.ADMIN:
        include.push({ model: Administrators,  as: 'administrator' })
        break
      case ROLE.ESTABLISHMENT:
        include.push({ model: Establishments,  as: 'establishment' })
        break
      case ROLE.STUDENT:
        include.push({ model: Students,        as: 'student' })
        break
    }

    return this.model.findOne({
      where:      { id: user.id },
      attributes: { exclude: ['password'] }, 
      include
    })
  }
}
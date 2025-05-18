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

   async findProfile(id) {
    // 1) Traer al usuario sin password para conocer su role_id
    const user = await this.model.findByPk(id, {
      attributes: { exclude: ["password"] }
    });
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }

    // 2) Montar el include según su rol
    const include = [];
    switch (user.role_id) {
      case ROLE.ADMIN:
        include.push({ model: Administrators,  as: "administrator" });
        break;
      case ROLE.ESTABLISHMENT:
        include.push({ model: Establishments,  as: "establishment" });
        break;
      case ROLE.STUDENT:
        include.push({ model: Students,        as: "student" });
        break;
    }

    // 3) Devolver el perfil completo (sin password) con su tabla asociada
    return this.model.findOne({
      where:      { id },
      attributes: { exclude: ["password"] },
      include
    });
  }
}
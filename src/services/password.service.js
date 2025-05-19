import bcrypt from 'bcrypt'
import { Users } from "../database/models/users.model.js";
import BaseService from "./base.service.js";

export default class PasswordService extends BaseService {
  constructor() {
    super(Users)
  }

async updatePassword(id, currentPassword, newPassword) {
    // 1) Traer hash actual
    const user = await Users.findByPk(id, {
      attributes: ["password"]
    });
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }

    // 2) Verificar contraseña actual
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      const err = new Error("Current password is incorrect");
      err.status = 400;
      throw err;
    }

    // 3) Hash de la nueva contraseña
    const saltRounds = 10;
    const hashed = await bcrypt.hash(newPassword, saltRounds);

    // 4) Actualizar en la base
    await Users.update(
      { password: hashed },
      { where: { id } }
    );
  }
}


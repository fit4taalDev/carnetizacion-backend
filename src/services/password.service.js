import bcrypt from 'bcrypt'
import { Users } from "../database/models/users.model.js";
import BaseService from "./base.service.js";

export default class PasswordService extends BaseService {
  constructor() {
    super(Users)
  }

  async updatePassword(id, newPassword) {
      // 1) Hash
      const hashed = await bcrypt.hash(newPassword, 10);

      // 2) Actualizar directamente en Users
      await Users.update(
        { password: hashed },
        { where: { id } }
      );

      // 3) Devolver el usuario sin el campo password
      return Users.findByPk(id, {
        attributes: { exclude: ['password'] }
      });
    }
}


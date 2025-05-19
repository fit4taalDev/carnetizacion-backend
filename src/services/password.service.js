import bcrypt from 'bcrypt'
import { Users } from "../database/models/users.model.js";
import BaseService from "./base.service.js";

export default class PasswordService extends BaseService {
  constructor() {
    super(Users)
  }

async updatePassword(id, currentPassword, newPassword) {

    const user = await Users.findByPk(id, {
      attributes: ["password"]
    });
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      const err = new Error("Current password is incorrect");
      err.status = 400;
      throw err;
    }

    const saltRounds = 10;
    const hashed = await bcrypt.hash(newPassword, saltRounds);

    await Users.update(
      { password: hashed },
      { where: { id } }
    );
  }
}


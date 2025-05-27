import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    const currentDate = new Date();
    await queryInterface.bulkInsert('users', [
      {
        id: process.env.ADMIN_ID,
        email: process.env.ADMIN_EMAIL,
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
        role_id: 0,
        first_time: false,
        createdAt: currentDate,
      },
      {
        id: process.env.ADMIN_INFO_ID,
        email: process.env.ADMIN_INFO_EMAIL,
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
        role_id: 0,
        first_time: false,
        createdAt: currentDate,
      },
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('establishments', null, {});
  }
};

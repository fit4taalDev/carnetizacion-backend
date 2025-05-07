import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    const currentDate = new Date();
    await queryInterface.bulkInsert('users', [
      {
        id: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
        email: process.env.ADMIN_EMAIL,
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

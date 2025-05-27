/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    await queryInterface.bulkInsert('administrators', [
      {
        id: process.env.ADMIN_ID,
        fullname: 'Pablo Ruiz',
        phone_number: "123456789",
        user_id: process.env.ADMIN_ID,
        createdAt: new Date()
      },
      // {
      //   id: process.env.ADMIN_INFO_ID,
      //   fullname: process.env.ADMIN_INFO_NAME,
      //   phone_number: "123456780",
      //   user_id: process.env.ADMIN_INFO_ID,
      //   createdAt: new Date()
      // },
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('student_roles', null, {});
  }
};

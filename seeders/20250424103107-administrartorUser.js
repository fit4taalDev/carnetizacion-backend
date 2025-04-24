/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    await queryInterface.bulkInsert('administrators', [
      {
        id: "694caf97-6291-4e12-9985-22c5a15028f6",
        name: 'Pablo',
        lastname: 'Admin',
        phone_number: "123456789",
        user_id: "694caf97-6291-4e12-9985-22c5a15028f6",
        createdAt: new Date()
      },
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('student_roles', null, {});
  }
};

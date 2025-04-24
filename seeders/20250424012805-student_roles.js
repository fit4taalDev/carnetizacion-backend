/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    await queryInterface.bulkInsert('student_roles', [
      {
        id: 0,
        name: 'Standard'
      },
      {
        id: 1,
        name: 'Premium'
      }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('student_roles', null, {});
  }
};

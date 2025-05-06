/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    await queryInterface.bulkInsert('establishment_statuses', [
      {
        id: 0,
        name: 'active'
      },
      {
        id: 1,
        name: 'inactive'
      },
      {
        id: 2,
        name: 'pending'
      }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('establishment_statuses', null, {});
  }
};

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    await queryInterface.bulkInsert('establishment_roles', [
      {
        id: 0,
        name: 'qr'
      },
      {
        id: 1,
        name: 'noQr'
      }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('establishment_roles', null, {});
  }
};

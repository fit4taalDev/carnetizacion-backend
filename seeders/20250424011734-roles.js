/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    await queryInterface.bulkInsert('roles', [
      {
        id: 0,
        name: 'Administrator'
      },
      {
        id: 1,
        name: 'Establishment'
      },
      {
        id: 2,
        name: 'Student'
      },
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};

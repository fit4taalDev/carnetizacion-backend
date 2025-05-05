/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    await queryInterface.bulkInsert('establishment_categories', [
      {
        id: 0,
        name: 'restaurant'
      },
      {
        id: 1,
        name: 'coffe-shop'
      },
      {
        id: 2,
        name: 'store'
      },
      {
        id: 3,
        name: 'services'
      },
      {
        id: 4,
        name: 'Entertainment'
      },
      {
        id: 5,
        name: 'education'
      }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('establishment_categories', null, {});
  }
};

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    await queryInterface.bulkInsert('programs', [
      {
        id: 0,
        name: 'spanish-dutch'
      },
      {
        id: 1,
        name: 'english-dutch'
      },
      {
        id: 2,
        name: 'english'
      },
      {
        id: 3,
        name: 'spanish'
      },
      {
        id:4,
        name: 'inburguering'
      }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('programs', null, {});
  }
};

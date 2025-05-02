/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    await queryInterface.bulkInsert('administrators', [
      {
        id: "9a4a559d-5d65-4b78-8af2-98ade9634882",
        fullname: 'Pablo Ruiz',
        phone_number: "123456789",
        user_id: "9a4a559d-5d65-4b78-8af2-98ade9634882",
        createdAt: new Date()
      },
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('student_roles', null, {});
  }
};

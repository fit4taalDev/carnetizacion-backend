/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    await queryInterface.bulkInsert('administrators', [
      {
        id: "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
        fullname: 'Pablo Ruiz',
        phone_number: "123456789",
        user_id: "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
        createdAt: new Date()
      },
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('student_roles', null, {});
  }
};

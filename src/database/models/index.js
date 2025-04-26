import './studentRoles.model.js'
import './establishmentRoles.model.js'
import './administrators.model.js'
import { Students } from './students.model.js'
import { StudentRoles } from './studentRoles.model.js';
import { EstablishmentRoles } from './establishmentRoles.model.js';
import { Establishments } from './establishments.model.js';
import { Users } from './users.model.js';
import { Administrators } from './administrators.model.js';
import { Roles } from './roles.model.js';
import { Offers } from './offers.model.js';

StudentRoles.hasMany(Students, {foreignKey: 'student_role_id'});
Students.belongsTo(StudentRoles, {foreignKey: 'student_role_id'})

EstablishmentRoles.hasMany(Establishments, {foreignKey: 'establishment_role_id'});
Establishments.belongsTo(EstablishmentRoles,  {foreignKey: 'establishment_role_id'})

Users.hasOne(Administrators, {foreignKey: 'user_id'});
Administrators.belongsTo(Users, {foreignKey: 'user_id'});

Users.hasOne(Students, {foreignKey: 'user_id'});
Students.belongsTo(Users, {foreignKey: 'user_id'});

Users.hasOne(Establishments, {foreignKey: 'user_id'});
Establishments.belongsTo(Users, {foreignKey: 'user_id'});

Roles.hasMany(Users, {foreignKey: 'role_id'});
Users.belongsTo(Roles, {foreignKey: 'role_id'})
  

Establishments.hasMany(Offers, {foreignKey: 'establishment_id'})
Offers.belongsTo(Establishments, {foreignKey: 'establishment_id'})

Offers.belongsToMany(StudentRoles,{
    through: 'offer_student_role',
    foreignKey: 'offer_id', 
    otherKey: 'student_role_id'
})

StudentRoles.belongsToMany(Offers,{
    through: 'offer_student_role',
    foreignKey: 'student_role_id',
    otherKey: 'offer_id'
})  
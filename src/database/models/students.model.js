import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";
import { StudentRoles } from "./studentRoles.model.js";
import { Users } from "./users.model.js";

export const Students = sequelize.define('students', {
    id:{
        primaryKey: true,
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4
    },
    fullname:{
        allowNull: false,
        type: DataTypes.STRING
    },
    student_id: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
    },
    address: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
    },
    phone_number:{
        allowNull:false,
        type: DataTypes.STRING,
        unique: true
    },
    student_role_id: {
        allowNul: false,
        type:DataTypes.INTEGER,
        references: {
            model: StudentRoles,
            key: 'id'
        }
    },
    user_id:{
        allowNull: false,
        type:DataTypes.UUID,
        references: {
            model: Users,
            key:'id'
        }
    }

},{
    timestamps: true,
    updatedAt: false 
})
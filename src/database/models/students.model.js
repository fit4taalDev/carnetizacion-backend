import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../sequelize.js";
import { StudentRoles } from "./studentRoles.model.js";
import { Users } from "./users.model.js";
import { Programs } from "./programs.model.js";

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
        unique: false
    },
    phone_number:{
        allowNull: true,
        type: DataTypes.STRING,
        unique: true
    },
    qr_img:{
        type: DataTypes.TEXT,
        allowNull: false,
    },
    profile_photo:{
        type: DataTypes.TEXT,
        allowNull: true,
    },
    active:{
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    birth_date:{
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    program_id: {
        allowNul: false,
        type:DataTypes.INTEGER,
        references: {
            model: Programs,
            key: 'id'
        }
    },
    student_role_id: {
        allowNul: false,
        type:DataTypes.INTEGER,
        references: {
            model: StudentRoles,
            key: 'id'
        }
    },
    expiration_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(`CURRENT_TIMESTAMP + INTERVAL '1 year'`)
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
    updatedAt: false ,
    hooks: {
    beforeCreate(instance) {
      const expiration = new Date();
      expiration.setFullYear(expiration.getFullYear() + 1); 
      instance.expiration_date = expiration;
    }
  }
})
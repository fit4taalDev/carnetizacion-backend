import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";
import { Users } from "./users.model.js";

export const Administrators = sequelize.define('administrators', {
    id:{
        primaryKey: true,
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4
    },
    fullname: {
        allowNull: false,
        type: DataTypes.STRING
    },

    phone_number:{
        allowNull:true,
        type: DataTypes.STRING,
        unique: true
    },
    profile_photo:{
        allowNull: true,
        type: DataTypes.STRING,
    },
    user_id:{
        allowNull: false,
        unique: true,
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
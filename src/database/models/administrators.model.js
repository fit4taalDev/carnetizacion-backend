import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";
import { Users } from "./users.model.js";

export const Administrators = sequelize.define('administrators', {
    id:{
        primaryKey: true,
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4
    },
    name: {
        allowNull: false,
        type: DataTypes.STRING
    },
    lastname: {
        allowNull: false,
        type: DataTypes.STRING
    },
    phone_number:{
        allowNull:false,
        type: DataTypes.INTEGER,
        unique: true
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
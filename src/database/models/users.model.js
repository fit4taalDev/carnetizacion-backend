import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";

export const Users = sequelize.define('users', {
    id:{
        primaryKey: true,
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4
    },
    email: {
        allowNull: false,
        type: DataTypes.STRING,
        validate:{
            isEmail: true
        },
        unique: true
    },
    password: {
        allowNull: false,
        type: DataTypes.STRING        
    },

},{
    timestamps: true,
    updatedAt: false 
})
import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";
import { Roles } from "./roles.model.js";

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
    first_time:{ 
        allowNull:false,
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    role_id:{
        allowNull: false,
        type:DataTypes.INTEGER,
        references: {
            model: Roles,
            key:'id'
        }
    }

},{
    timestamps: true,
    updatedAt: false 
})
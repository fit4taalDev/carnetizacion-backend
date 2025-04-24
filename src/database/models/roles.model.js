import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";

export const Roles = sequelize.define('roles', {
    id:{
        primaryKey: true,
        autoIncrement: false,
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name:{
        allowNull: false,
        type: DataTypes.STRING,
    },
},{
    timestamps: false
})
import { DataTypes } from "sequelize"
import { sequelize } from "../sequelize.js"

export const EstablishmentStatus = sequelize.define('establishment_status', {
    id:{
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name:{
        allowNull: false,
        type: DataTypes.STRING,
    },
},{
    timestamps: false,
})
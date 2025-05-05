import { DataTypes } from "sequelize"
import { sequelize } from "../sequelize.js"

export const EstablishmentCategories = sequelize.define('establishment_categories', {
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
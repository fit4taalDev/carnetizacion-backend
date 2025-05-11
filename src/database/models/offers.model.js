import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";
import { Establishments } from "./establishments.model.js";

export const Offers = sequelize.define('offers', {
    id:{
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    title:{
        allowNull: false,
        type: DataTypes.STRING,
    },
    description: {
        allowNull: false,
        type: DataTypes.TEXT,
    },
    conditions: {
        allowNull: false,
        type: DataTypes.TEXT,
    },
    end_date:{
        allowNull: false,
        type: DataTypes.DATE,
    },
    discount_applied:{
        allowNull: false,
        type: DataTypes.STRING
    },
    normal_price: {
        allowNull: false,
        type: DataTypes.DECIMAL(10, 2),
    },
    discount_price:{
        allowNull: false,
        type: DataTypes.DECIMAL(10, 2),
    },
    offer_image:{
        type: DataTypes.TEXT,
        allowNull: true,
    },
    active:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    max_redemptions_per_student: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1   // por defecto sólo 1 canje por estudiante
    },
    establishment_id: {
        allowNull: false,
        type:DataTypes.UUID,
        references:{
            model: Establishments,
            key: "id"
        }
    }
    
})
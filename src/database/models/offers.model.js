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
    start_date:{
        allowNull: false,
        type: DataTypes.DATE,
    },

    end_date:{
        allowNull: false,
        type: DataTypes.DATE,
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
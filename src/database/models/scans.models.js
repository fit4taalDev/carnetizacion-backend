import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";
import { Establishments } from "./establishments.model.js";
import { Students } from "./students.model.js";

export const Scans = sequelize.define('scans', {
    id:{
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
    },
    student_id:{
        allowNull: false,
        type:DataTypes.UUID,
        references:{
            model: Students,
            key: 'id'
        }
    },
    establishment_id:{
        allowNull: false,
        type:DataTypes.UUID,
        references:{
            model: Establishments,
            key: 'id'
        }
    }, 
    scanned_at:{
        allowNull: false,
        type: DataTypes.DATE,
    },
},{
    timestamps: false
})
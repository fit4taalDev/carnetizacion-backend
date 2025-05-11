import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";
import { Students } from "./students.model.js";
import { Offers } from "./offers.model.js";

export const OfferRedemptions = sequelize.define('offer_redemptions', {
    id:{
        primaryKey: true,
        type: DataTypes.INTEGER, 
        autoIncrement:true
    },

    student_id: {
        allowNul: false,
        type:DataTypes.UUID,
        references: {
            model: Students,
            key: 'id'
        }
    },
    offer_id:{
        allowNull: false,
        type:DataTypes.INTEGER,
        references: {
            model: Offers,
            key:'id'
        }
    }

},{
    timestamps: true,
    updatedAt: false ,
    indexes: [
      {
        unique: false,
        fields: ['offer_id', 'student_id']
      }
    ]
})
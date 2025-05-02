import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";
import { EstablishmentRoles } from "./establishmentRoles.model.js";
import { Users } from "./users.model.js";

export const Establishments = sequelize.define('establishments', {
    id:{
        primaryKey: true,
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4
    },
    fullname: {
        allowNull: false,
        type: DataTypes.STRING
    },
    phone_number:{
        allowNull:false,
        type: DataTypes.INTEGER,
        unique: true
    },
    establishment_name:{
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
    },
    establishment_address:{
        allowNull: false,
        type: DataTypes.STRING,
    },
    establishment_id:{
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
    },
    qr_img:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    profile_photo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    establishment_role_id:{
        allowNull: false,
        type:DataTypes.INTEGER,
        references: {
            model: EstablishmentRoles,
            key:'id'
        }
    },
    user_id:{
        allowNull: false,
        unique: true,
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
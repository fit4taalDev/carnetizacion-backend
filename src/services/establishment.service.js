
import { Users } from "../database/models/users.model.js";
import bcrypt from 'bcrypt'
import BaseService from "./base.service.js";
import { Establishments } from "../database/models/establishments.model.js";
import { EstablishmentRoles } from "../database/models/establishmentRoles.model.js";
import { generateEstablishmentQRCode } from "../utils/establishmentQR.util.js";
import { uploadImage } from "../utils/savePicture.js";
import { sequelize } from "../database/sequelize.js";
import { Op } from "sequelize";

class EstablishmentService extends BaseService{
    constructor(){
        super(Establishments)
    }

    async checkIfExistIn(model, field, value, message) {
        const existing = await model.findOne({ where: { [field]: value } });
        if (existing) {
            throw new Error(message);
        }
    }

    async createEstablishment(data, fileBuffer, fileMeta) {
        return sequelize.transaction(async (t) => {
          const genericPassword = data.establishment_id + '#';
          const userData = {
            email: data.email.toLowerCase(),
            password: await bcrypt.hash(genericPassword, 10),
            role_id: 1, 
          };

          await this.checkIfExistIn(Users, 'email', data.email,
            'The email address is already registered',
            { transaction: t }
          );
          await this.checkIfExistIn(Establishments, 'establishment_name', data.establishment_name,
            'The establishment name is already registered',
            { transaction: t }
          );
          await this.checkIfExistIn(Establishments, 'phone_number', data.phone_number,
            'The phone number is already registered',
            { transaction: t }
          );
          await this.checkIfExistIn(Establishments, 'establishment_id', data.establishment_id,
            'The establishment id is already registered',
            { transaction: t }
          );

          await this.checkIfExistIn(Establishments, 'kvk', data.kvk,
            'The kvk is already registered',
            { transaction: t }
          );
    
          const newUser = await Users.create(userData, { transaction: t });

          const qrEstablishent = await generateEstablishmentQRCode(`${process.env.FRONTEND_URL}/${data.establishment_id}`)

          let profilePath = null;
          if (fileBuffer && fileMeta) {
            profilePath = await uploadImage(fileBuffer, fileMeta);
          }
    
          const newEstablishmentData = {
            ...data,
            id: newUser.id,
            user_id: newUser.id,
            profile_photo: profilePath,
            qr_img: qrEstablishent
          };
    
          const newEstablishment = await Establishments.create(newEstablishmentData, { transaction: t });
          return newEstablishment;
        });
      }

      async findAllEstablishments(role, establishment_name, status, dateFrom, dateTo, establishment ) {
        const whereEstablishemnt = {}
        
        if (establishment_name) {
            whereEstablishemnt.establishment_name = { [Op.iLike]: `%${establishment_name}%` };
        }
        if (role) {
          whereEstablishemnt.establishment_role_id = Number(role);
        }

        if (status) {
          const statusId = parseInt(status, 10);
          if (isNaN(statusId)) {
            throw new Error(`El parámetro status debe ser un número válido, no: "${status}"`);
          }
          whereEstablishemnt.establishment_status_id = statusId;
        }

        if (dateFrom || dateTo) {
            whereEstablishemnt.createdAt = {};
            if (dateFrom) {
              whereEstablishemnt.createdAt[Op.gte] = new Date(dateFrom);
            }
            if (dateTo) {
              const end = new Date(dateTo);
              end.setHours(23, 59, 59, 999);
              whereEstablishemnt.createdAt[Op.lte] = end;
            }
          }
    
        if (establishment !== undefined && !isNaN(establishment)) {
          whereEstablishemnt.establishment_category_id = establishment;
        }
        return await Establishments.findAll({
          where: whereEstablishemnt,
          include: [
            {
              model: EstablishmentRoles,
              attributes: ['name'],
            },
            {
              model: Users,
              attributes: ['email']
            },
          ],
          attributes: {
            include: [
              [
                sequelize.literal(`(
                  SELECT COUNT(*)
                  FROM offers AS off
                  WHERE off.establishment_id = "establishments"."id"
                )`),
                'offersCount'
              ]
            ],
            exclude: [
              'user_id',
              'establishment_role_id',
              'establishment_category_id'
            ]
          }
        });
      }

    async findById(id){
        return this.model.findOne({
            where: {id:id},
            include: [{
                model: EstablishmentRoles,
                attributes: ['name']
            },
            {
                model: Users,
                attributes: ['email'],
            }],
            attributes:{
                exclude: ['user_id', 'establishment_role_id']
            }
        })
    }


    async
}

export default EstablishmentService

import { Users } from "../database/models/users.model.js";
import bcrypt from 'bcrypt'
import BaseService from "./base.service.js";
import { Establishments } from "../database/models/establishments.model.js";
import { EstablishmentRoles } from "../database/models/establishmentRoles.model.js";
import { generateEstablishmentQRCode } from "../utils/establishmentQR.util.js";
import { uploadImage } from "../utils/savePicture.js";
import { sequelize } from "../database/sequelize.js";

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
          // 1. Crear el usuario asociado
          const genericPassword = data.establishment_id + '#';
          const userData = {
            email: data.email.toLowerCase(),
            password: await bcrypt.hash(genericPassword, 10),
            role_id: 1, // rol de establecimiento
          };
    
          // 2. Validaciones de unicidad dentro de la transacción
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
    
          // 3. Crear el usuario
          const newUser = await Users.create(userData, { transaction: t });

          const qrEstablishent = await generateEstablishmentQRCode(`${process.env.FRONTEND_URL}/${data.establishment_id}`)
    
          // 4. Subir la imagen (si vino)
          let profilePath = null;
          if (fileBuffer && fileMeta) {
            profilePath = await uploadImage(fileBuffer, fileMeta);
          }
    
          // 5. Armar datos finales y crear el establecimiento
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

      async findAllEstablishments(role) {
        const whereCondition = role ? { name: role } : undefined;
    
        return await Establishments.findAll({
          where: whereCondition,
          include: [
            {
              model: EstablishmentRoles,
              attributes: ['name'],
              where: whereCondition,
              required: !!role
            },
            {
              model: Users,
              attributes: ['email']
            }
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
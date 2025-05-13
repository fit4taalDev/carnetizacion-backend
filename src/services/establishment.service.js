
import { Users } from "../database/models/users.model.js";
import bcrypt from 'bcrypt'
import BaseService from "./base.service.js";
import { Establishments } from "../database/models/establishments.model.js";
import { EstablishmentRoles } from "../database/models/establishmentRoles.model.js";
import { generateEstablishmentQRCode } from "../utils/establishmentQR.util.js";
import { uploadImage } from "../utils/savePicture.js";
import { sequelize } from "../database/sequelize.js";
import { Op, QueryTypes } from "sequelize";
import { Storage } from "@google-cloud/storage";
import { EstablishmentCategories } from "../database/models/establishmentCategories.model.js";
import { generateSignedUrl } from "../utils/signedUrl.js";
import { Offers } from "../database/models/offers.model.js";
import { OfferRedemptions } from "../database/models/offerRedemptions.js";


const storage = new Storage({ keyFilename: process.env.KEY_FILE_NAME });
const bucket  = storage.bucket(process.env.GCP_BUCKET_NAME);

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
            profilePath = await uploadImage(fileBuffer, fileMeta, 'establishment');
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
        const establishments =  await Establishments.findAll({
          where: whereEstablishemnt,
          include: [
            {
              model: EstablishmentRoles,
              attributes: ['name'],
            },
            {
              model: EstablishmentCategories,
              attributes: ['id','name'],
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
        const enriched = await Promise.all(
          establishments.map(async inst => {
            const establishment = inst.get({ plain: true })
      
            if (establishment.qr_img) {
              establishment.qr_img = await generateSignedUrl(establishment.qr_img, 7200)
            }
            if (establishment.profile_photo) {
              establishment.profile_photo = await generateSignedUrl(establishment.profile_photo, 7200)
            }
      
            return establishment
          })
        )
        
          return enriched
      }

    async findById(id){
        return this.model.findOne({
            where: {id:id},
            include: [{
                model: EstablishmentRoles,
                attributes: ['name']
            },
            {
              model: EstablishmentCategories,
              attributes: ['id','name'],
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

   async findAllEstablishmentStudent(search,category) {
   const where = { establishment_status_id: 0 }

    if (search) {
      where.establishment_name = { [Op.iLike]: `%${search}%` }
    }

    if (category !== '') {
      const catId = parseInt(category, 10)
      if (!Number.isNaN(catId)) {
        where.establishment_category_id = catId
      }
    }
    const establishments = await this.model.findAll({
      where,
      attributes: [
        'id',
        'establishment_name',
        'establishment_address',
        'description',
        'profile_photo',
        'establishment_category_id',
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM offers
            WHERE offers.establishment_id = establishments.id
          )`),
          'offersCount'
        ]
      ]
    })

    const enriched = await Promise.all(
      establishments.map(async inst => {
        const e = inst.get({ plain: true })
        e.offersCount = parseInt(e.offersCount, 10)

        if (e.qr_img) {
          e.qr_img = await generateSignedUrl(e.qr_img, 7200)
        }
        if (e.profile_photo) {
          e.profile_photo = await generateSignedUrl(e.profile_photo, 7200)
        }
        return e
      })
    )

    return enriched
  }

 async findByIdStudent(establishment_id, student_id) {
    // 1) Cargar establecimiento con sus ofertas activas y vigentes
    const inst = await this.model.findOne({
      where: { id: establishment_id },
      attributes: [
        'id',
        'establishment_name',
        'establishment_address',
        'description',
        'profile_photo',
        'establishment_category_id'
      ],
      include: [{
        model: Offers,
        attributes: [
          'id',
          'title',
          'description',
          'conditions',
          'end_date',
          'discount_applied',
          'normal_price',
          'discount_price',
          'offer_image',
          'active'
        ],
        where: {
          active: true,
          end_date: { [Op.gte]: new Date() }
        },
        required: false
      }]
    })
    if (!inst) return null

    // 2) Serializar y firmar imágenes
    const establishment = inst.get({ plain: true })
    if (establishment.profile_photo) {
      establishment.profile_photo = await generateSignedUrl(
        establishment.profile_photo, 7200
      )
    }
    establishment.offers = await Promise.all(
      (establishment.offers || []).map(async o => ({
        ...o,
        offer_image: o.offer_image
          ? await generateSignedUrl(o.offer_image, 7200)
          : null
      }))
    )

    // 3) Obtener student_role_ids de cada oferta
    const offerIds = establishment.offers.map(o => o.id)
    let roleMap = {}
    if (offerIds.length) {
      const rows = await sequelize.query(
        `SELECT offer_id, student_role_id
         FROM offer_student_role
         WHERE offer_id IN (:offerIds)`,
        {
          replacements: { offerIds },
          type: QueryTypes.SELECT
        }
      )
      roleMap = rows.reduce((acc, { offer_id, student_role_id }) => {
        acc[offer_id] = acc[offer_id] || []
        acc[offer_id].push(student_role_id)
        return acc
      }, {})
    }
    establishment.offers = establishment.offers.map(o => ({
      ...o,
      student_role_ids: roleMap[o.id] || []
    }))

    // 4) Consultar redenciones previas de este estudiante
    const redeemed = await OfferRedemptions.findAll({
      where: {
        student_id,
        offer_id: offerIds
      },
      attributes: ['offer_id'],
      raw: true
    })
    const redeemedIds = redeemed.map(r => r.offer_id)

    // 5) Filtrar solo ofertas no redimidas
    establishment.offers = establishment.offers.filter(
      o => !redeemedIds.includes(o.id)
    )

    return establishment
  }
}

export default EstablishmentService
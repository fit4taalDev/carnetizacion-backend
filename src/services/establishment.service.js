
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
import { Students } from "../database/models/students.model.js";
import { translated } from "../utils/translated.js";


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

    const qrEstablishent = await generateEstablishmentQRCode(`${process.env.FRONTEND_URL}/${data.establishment_id}`);

    let profilePath = null;
    if (fileBuffer && fileMeta) {
      profilePath = await uploadImage(fileBuffer, fileMeta, 'establishment');
    }

    // Traducción actualizada con soporte para arreglo en translatedText
    let description_en = null;
    let description_es = null;

    try {
      const [enResult, esResult] = await Promise.all([
        translated(data.description, 'en'),
        translated(data.description, 'es')
      ]);

      description_en = enResult.data.translations.translatedText[0];
      description_es = esResult.data.translations.translatedText[0];
    } catch (error) {
      console.error('Error translating description:', error);
    }

    const newEstablishmentData = {
      ...data,
      id: newUser.id,
      user_id: newUser.id,
      profile_photo: profilePath,
      qr_img: qrEstablishent,
      description_en,
      description_es
    };

    const newEstablishment = await Establishments.create(newEstablishmentData, { transaction: t });
    return newEstablishment;
  });
}


  async updateEstablishment(id, data, fileBuffer, fileMeta) {
    return sequelize.transaction(async (t) => {
      const est = await Establishments.findByPk(id, { transaction: t });
      if (!est) {
        const err = new Error('Establishment not found');
        err.status = 404;
        throw err;
      }

      const user = await Users.findByPk(est.user_id, { transaction: t });
      if (data.email !== undefined) {
        const newEmail = data.email.toLowerCase();
        if (newEmail !== user.email) {
          const exists = await Users.findOne({
            where: { email: newEmail, id: { [Op.ne]: user.id } },
            transaction: t
          });
          if (exists) {
            const err = new Error('The email address is already registered');
            err.status = 400;
            throw err;
          }
          user.email = newEmail;
          await user.save({ transaction: t });
        }
      }

      if (data.establishment_id !== undefined) {
        const newEstId = data.establishment_id;
        if (newEstId !== est.establishment_id) {
          const exists = await Establishments.findOne({
            where: { establishment_id: newEstId, id: { [Op.ne]: est.id } },
            transaction: t
          });
          if (exists) {
            const err = new Error('The establishment id is already registered');
            err.status = 400;
            throw err;
          }
          est.establishment_id = newEstId;
          est.qr_img = await generateEstablishmentQRCode(
            `${process.env.FRONTEND_URL}/${newEstId}`
          );
        }
      }

      if (data.establishment_name !== undefined) {
        const newName = data.establishment_name;
        if (newName !== est.establishment_name) {
          const exists = await Establishments.findOne({
            where: { establishment_name: newName, id: { [Op.ne]: est.id } },
            transaction: t
          });
          if (exists) {
            const err = new Error('The establishment name is already registered');
            err.status = 400;
            throw err;
          }
          est.establishment_name = newName;
        }
      }

      if (data.phone_number !== undefined) {
        const newPhone = parseInt(data.phone_number, 10);
        if (isNaN(newPhone)) {
          const err = new Error(`El parámetro phone_number debe ser un número válido, no: "${data.phone_number}"`);
          err.status = 400;
          throw err;
        }
        if (newPhone !== est.phone_number) {
          const exists = await Establishments.findOne({
            where: { phone_number: newPhone, id: { [Op.ne]: est.id } },
            transaction: t
          });
          if (exists) {
            const err = new Error('The phone number is already registered');
            err.status = 400;
            throw err;
          }
          est.phone_number = newPhone;
        }
      }

      if (data.kvk !== undefined) {
        const newKvk = data.kvk;
        if (newKvk !== est.kvk) {
          const exists = await Establishments.findOne({
            where: { kvk: newKvk, id: { [Op.ne]: est.id } },
            transaction: t
          });
          if (exists) {
            const err = new Error('The kvk is already registered');
            err.status = 400;
            throw err;
          }
          est.kvk = newKvk;
        }
      }

      if (fileBuffer && fileMeta) {
        const profilePath = await uploadImage(fileBuffer, fileMeta, 'establishment');
        est.profile_photo = profilePath;
      }

      const skip = ['email','establishment_id','establishment_name','phone_number','kvk'];
      for (const [key, value] of Object.entries(data)) {
        if (!skip.includes(key) && value !== undefined) {
          est[key] = value;
        }
      }

      await est.save({ transaction: t });
      return est;
      });
    }


    async findAllEstablishments(
      role,
      establishment_name,
      status,
      dateFrom,
      dateTo,
      establishment,
      page = 1,
      pageSize = 10
    ) {
      const where = {};
      if (establishment_name) {
        where.establishment_name = { [Op.iLike]: `%${establishment_name}%` };
      }
      if (role) {
        where.establishment_role_id = Number(role);
      }
      if (status) {
        const statusId = parseInt(status, 10);
        if (isNaN(statusId)) {
          throw new Error(`El parámetro status debe ser un número válido, no: "${status}"`);
        }
        where.establishment_status_id = statusId;
      }
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) {
          where.createdAt[Op.gte] = new Date(dateFrom);
        }
        if (dateTo) {
          const end = new Date(dateTo);
          end.setHours(23, 59, 59, 999);
          where.createdAt[Op.lte] = end;
        }
      }
      if (establishment !== undefined && !isNaN(establishment)) {
        where.establishment_category_id = establishment;
      }

      const offset = (page - 1) * pageSize;
      const { count: totalItems, rows } = await Establishments.findAndCountAll({
        where,
        // Ordenar por establishment_id en orden descendente
        order: [['establishment_id', 'DESC']],
        limit: pageSize,
        offset,
        include: [
          { model: EstablishmentRoles, attributes: ['name'] },
          { model: EstablishmentCategories, attributes: ['id', 'name'] },
          { model: Users, attributes: ['email'] }
        ],
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM public.offers AS off
                WHERE off.establishment_id = establishments.id
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
        rows.map(async inst => {
          const e = inst.get({ plain: true });
          e.offersCount = parseInt(e.offersCount, 10);
          if (e.qr_img) {
            e.qr_img = await generateSignedUrl(e.qr_img, 7200);
          }
          if (e.profile_photo) {
            e.profile_photo = await generateSignedUrl(e.profile_photo, 7200);
          }
          return e;
        })
      );

      const totalPages = Math.ceil(totalItems / pageSize);
      return {
        data: enriched,
        pagination: { page, pageSize, totalItems, totalPages }
      };
    }
    async findById(id, page = 1, pageSize = 10) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const inst = await this.model.findOne({
          where: { id },
          include: [
            { model: EstablishmentRoles, attributes: ['name'] },
            { model: Users, attributes: ['email'] }
          ],
          attributes: {
            exclude: ['user_id', 'establishment_role_id']
          }
        });
        if (!inst) return null;
        const establishment = inst.get({ plain: true });

        if (establishment.qr_img)        establishment.qr_img        = await generateSignedUrl(establishment.qr_img,        7200);
        if (establishment.profile_photo) establishment.profile_photo = await generateSignedUrl(establishment.profile_photo, 7200);

        // Total de cupones activos (ofertas vigentes y activas)
        const totalActiveCoupons = await Offers.count({
          where: {
            establishment_id: id,
            active: true,
            end_date: { [Op.gte]: now }
          }
        });

        // Cupones redimidos este mes
        const redeemedThisMonth = await OfferRedemptions.count({
          include: [{ model: Offers, where: { establishment_id: id } }],
          where: {
            createdAt: { [Op.between]: [startOfMonth, endOfMonth] }
          }
        });

        // ID del descuento más usado (offer_id con más redenciones)
        const mostUsed = await OfferRedemptions.findAll({
          include: [{ model: Offers, where: { establishment_id: id }, attributes: [] }],
          attributes: [
            'offer_id',
            [sequelize.fn('COUNT', sequelize.col('offer_id')), 'use_count']
          ],
          group: ['offer_id'],
          order: [[sequelize.literal('"use_count"'), 'DESC']],
          limit: 1
        });
        const mostUsedDiscountId = mostUsed.length ? mostUsed[0].get('offer_id') : null;

        const offset = (page - 1) * pageSize;
        const { count: totalItems, rows } = await OfferRedemptions.findAndCountAll({
          where: {},
          include: [{ model: Offers, where: { establishment_id: id }, attributes: ['id', 'title', 'end_date', 'discount_price', 'offer_image', 'normal_price']},
          {
              model: Students,
              attributes: ['fullname', 'student_id']
            }],
          order: [['createdAt', 'DESC']],
          limit: pageSize,
          offset
        });

        const paginated = await Promise.all(
          rows.map(async r => {
            const redemption = r.get({ plain: true });
            if (redemption.Offer && redemption.Offer.offer_image) {
              redemption.Offer.offer_image = await generateSignedUrl(redemption.Offer.offer_image, 7200);
            }
            return redemption;
          })
        );

        const totalPages = Math.ceil(totalItems / pageSize);

        establishment.totalActiveCoupons = totalActiveCoupons;
        establishment.redeemedThisMonth = redeemedThisMonth;
        establishment.mostUsedDiscountId = mostUsedDiscountId;
        establishment.offerRedemptions = paginated;
        establishment.pagination = { page, pageSize, totalItems, totalPages };

        return establishment;
    }

    async findAllEstablishmentStudent(
        search = '',
        category = '',
        studentId,
        page = 1,
        pageSize = 10
      ) {
        const where = { establishment_status_id: 0 }

        if (search) {
          where.establishment_name = { [Op.iLike]: `%${search}%` }
        }
        if (category) {
          const catId = Number(category)
          if (!Number.isNaN(catId)) {
            where.establishment_category_id = catId
          }
        }

        const offset = (page - 1) * pageSize

        const { count: totalItems, rows } = await Establishments.findAndCountAll({
          where,
          limit:  pageSize,
          offset,
          order: [['id', 'DESC']],
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
                  FROM offers AS o
            LEFT JOIN offer_redemptions AS r
                    ON r.offer_id = o.id
                  AND r.student_id = '${studentId}'
                WHERE o.establishment_id = establishments.id
                  AND r.id IS NULL
              )`),
              'offersCount'
            ]
          ]
        })

        const establishments = await Promise.all(
          rows.map(async inst => {
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

        const totalPages = Math.ceil(totalItems / pageSize)

        return {
          establishments,
          pagination: {
            page,
            pageSize,
            totalPages,
            totalItems
          }
        }
    }

    async findByIdStudent(establishment_id, student_id, page = 1, pageSize = 10) {
        const inst = await this.model.findByPk(establishment_id, {
          attributes: [
            'id',
            'establishment_name',
            'establishment_address',
            'description',
            'profile_photo',
            'establishment_category_id'
          ]
        })
        if (!inst) return null

        const establishment = inst.get({ plain: true })


        if (establishment.profile_photo) {
          establishment.profile_photo = await generateSignedUrl(
            establishment.profile_photo,
            7200
          )
        }

        const offset = (page - 1) * pageSize

    
        const offerWhere = {
          establishment_id,
          active: true,
          end_date: { [Op.gte]: new Date() }
        }
        
        const notRedeemed = sequelize.literal(`NOT EXISTS (
          SELECT 1
            FROM offer_redemptions AS r
          WHERE r.offer_id = offers.id
            AND r.student_id = '${student_id}'
        )`)

        const { count: totalItems, rows } = await Offers.findAndCountAll({
          where: {
            ...offerWhere,
            [Op.and]: [notRedeemed]
          },
          limit:  pageSize,
          offset,
          order: [['id', 'DESC']],
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
          ]
        })

        let offers = await Promise.all(
          rows.map(async inst => {
            const o = inst.get({ plain: true })
            if (o.offer_image) {
              o.offer_image = await generateSignedUrl(o.offer_image, 7200)
            }
            return o
          })
        )

        const offerIds = offers.map(o => o.id)
        if (offerIds.length) {
          const rowsRoles = await sequelize.query(
            `SELECT offer_id, student_role_id
              FROM offer_student_role
              WHERE offer_id IN (:offerIds)`,
            {
              replacements: { offerIds },
              type: QueryTypes.SELECT
            }
          )
          const roleMap = rowsRoles.reduce((acc, { offer_id, student_role_id }) => {
            acc[offer_id] = acc[offer_id] || []
            acc[offer_id].push(student_role_id)
            return acc
          }, {})
          offers = offers.map(o => ({
            ...o,
            student_role_ids: roleMap[o.id] || []
          }))
        }

        const totalPages = Math.ceil(totalItems / pageSize)

        return {
          establishment,
          offers,
          pagination: {
            page,
            pageSize,
            totalPages,
            totalItems
          }
        }
    }
}

export default EstablishmentService
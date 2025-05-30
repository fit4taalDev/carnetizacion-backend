import BaseService from "./base.service.js";
import { Offers } from "../database/models/offers.model.js";
import { sequelize } from "../database/sequelize.js";
import { StudentRoles } from "../database/models/studentRoles.model.js";
import { uploadImage } from "../utils/savePicture.js";
import { generateSignedUrl } from "../utils/signedUrl.js";
import { Establishments } from "../database/models/establishments.model.js";
import { Op } from "sequelize";

class OffersService extends BaseService {
  constructor() {
    super(Offers);
  }

  async create(data, fileBuffer, fileMeta) {
    if (fileBuffer && fileMeta) {
      const imageKey = await uploadImage(
        fileBuffer,
        fileMeta,
        data.establishment_id.toString(),
        'offers'
      )
      data.offer_image = imageKey
    }

    let { student_role_ids, ...offerData } = data
    const offer = await super.create(offerData)

    if (!student_role_ids || student_role_ids.length === 0) {
      const allRoles = await StudentRoles.findAll()
      student_role_ids = allRoles.map(role => role.id)
    }

    const offerStudentRoles = student_role_ids.map(role_id => ({
      offer_id:        offer.id,
      student_role_id: role_id
    }))
    await sequelize.models.offer_student_role.bulkCreate(offerStudentRoles)

    return offer
  }


  async update(id, data, fileBuffer, fileMeta) {
    if (fileBuffer && fileMeta) {
      const imageKey = await uploadImage(
        fileBuffer,
        fileMeta,
        data.establishment_id.toString(),
        'offers'
      )
      data.offer_image = imageKey
    }

    const { student_role_ids, ...offerData } = data

    await super.update(id, offerData)

    await sequelize.models.offer_student_role.destroy({
      where: { offer_id: id }
    })

    let roles = student_role_ids
    if (!Array.isArray(roles) || roles.length === 0) {
      const all = await StudentRoles.findAll()
      roles = all.map(r => r.id)
    }
    const rows = roles.map(role_id => ({
      offer_id:        id,
      student_role_id: role_id
    }))
    await sequelize.models.offer_student_role.bulkCreate(rows)

    return await Offers.findByPk(id)
  }


  async findAll(role) {
    const whereCondition = role?.length ? { name: role } : undefined

    const offers = await this.model.findAll({
      include: [
        {
          model: StudentRoles,
          as: 'student_roles',
          through: { attributes: [] },
          required: !!role?.length,
          where: whereCondition
        }
      ]
    })

    const now = new Date()
    for (const offer of offers) {
      if (offer.end_date < now && offer.active) {
        offer.active = false
        await offer.save()
      }
    }

    const enriched = await Promise.all(
      offers.map(async inst => {
        const offer = inst.get({ plain: true })
        if (offer.offer_image ) {
          offer.offer_image  = await generateSignedUrl(offer.offer_image , 7200)
        }
        return offer
      })
    )

    return enriched
  }

async findAllByEstablishment(establishmentId, role, search, active, dateFrom, dateTo, validity, expirationDate, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize
  const whereOffer = {
    establishment_id: establishmentId,
    ...(active !== undefined && { active }),
    ...(search && { [Op.or]: [{ title: { [Op.iLike]: `%${search}%` } }, { id: !isNaN(Number(search)) ? Number(search) : -1 }] })
  }
  if (dateFrom || dateTo) {
    whereOffer.end_date = {}
    if (dateFrom) whereOffer.end_date[Op.gte] = new Date(dateFrom)
    if (dateTo) { const end = new Date(dateTo); end.setHours(23, 59, 59, 999); whereOffer.end_date[Op.lte] = end }
  }
  if (validity === true) whereOffer[Op.and] = [...(whereOffer[Op.and] || []), { end_date: { [Op.gte]: new Date() } }]
  else if (validity === false) whereOffer[Op.and] = [...(whereOffer[Op.and] || []), { end_date: { [Op.lt]: new Date() } }]
  let order = []
  if (expirationDate === 'soon') order = [['end_date', 'ASC']]
  else if (expirationDate === 'far') order = [['end_date', 'DESC']]
  const { count: totalItems, rows: offers } = await this.model.findAndCountAll({
    where: whereOffer,
    include: [{ model: StudentRoles, as: 'student_roles', through: { attributes: [] }, required: !!role, where: role ? { name: role } : undefined }],
    distinct: true,
    order,
    limit: pageSize,
    offset
  })
  const now = new Date()
  const data = await Promise.all(offers.map(async inst => {
    if (inst.end_date < now && inst.active) { inst.active = false; await inst.save() }
    const o = inst.get({ plain: true })
    if (o.offer_image) o.offer_image = await generateSignedUrl(o.offer_image, 7200)
    return o
  }))
  return {
    data,
    pagination: {
      page,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
      totalItems
    }
  }
}

async findAllByEstablishmentID(establishmentId, role, page = 1, pageSize = 10, status = 'all') {

    page = Number.isInteger(page) && page > 0 ? page : 1;
    pageSize = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 10;

    const whereOffer = { establishment_id: establishmentId };


    if (status === 'active') {
      whereOffer.active = true;
    } else if (status === 'inactive') {
      whereOffer.active = false;
    }

    const roleFilter = role ? { name: role } : undefined;


    const offset = (page - 1) * pageSize;

    const { count: totalItems, rows } = await Offers.findAndCountAll({
      where: whereOffer,
      include: [
        {
          model: StudentRoles,
          as: 'student_roles',
          through: { attributes: [] },
          required: Boolean(roleFilter),
          ...(roleFilter && { where: roleFilter })
        },
        {
          model: Establishments,
          attributes: ['establishment_name']
        }
      ],
      order: [['id', 'DESC']],
      limit: pageSize,
      offset
    });

    const data = await Promise.all(
      rows.map(async inst => {
        const offer = inst.get({ plain: true });
        if (offer.offer_image) {
          offer.offer_image = await generateSignedUrl(offer.offer_image, 7200);
        }
        return offer;
      })
    );

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data,
      pagination: { page, pageSize, totalItems, totalPages }
    };
  }


  async findById(id) {
    const inst = await this.model.findOne({
      where: { id },
      include: [
        {
          model: StudentRoles,
          as: 'student_roles',
          through: { attributes: [] },
          required: false
        },
        {
          model: Establishments,
          attributes: ['establishment_name', 'establishment_address','establishment_category_id', 'description']
        }
      ]
    });
    if (!inst) return null;
  
    const offer = inst.get({ plain: true });
  
    if (offer.offer_image) {
      offer.offer_image = await generateSignedUrl(offer.offer_image, 7200);
    }

    offer.student_role_ids = offer.student_roles.map(r => r.id);
  
    return offer;
  }

  async updateActive(id){
    const offer = await this.model.findByPk(id);
    if (!offer) throw new Error(`Offer with id ${id} not found`)
    
    offer.active = !offer.active
    await offer.save()

    return offer.get({ plain: true })

  }
}

export default OffersService;

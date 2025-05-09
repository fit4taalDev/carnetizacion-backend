import BaseService from "./base.service.js";
import { Offers } from "../database/models/offers.model.js";
import { sequelize } from "../database/sequelize.js";
import { StudentRoles } from "../database/models/studentRoles.model.js";
import { uploadImage } from "../utils/savePicture.js";
import { generateSignedUrl } from "../utils/signedUrl.js";
import { Establishments } from "../database/models/establishments.model.js";

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
    // 1) Si hay nueva imagen, subirla y setear data.offer_image
    if (fileBuffer && fileMeta) {
      const imageKey = await uploadImage(
        fileBuffer,
        fileMeta,
        data.establishment_id.toString(),
        'offers'
      )
      data.offer_image = imageKey
    }

    // 2) Separar roles del resto de campos
    const { student_role_ids, ...offerData } = data

    // 3) Actualizar la oferta
    await super.update(id, offerData)

    // 4) Reemplazar relaciones en la tabla pivote
    //   - primero borramos las antiguas
    await sequelize.models.offer_student_role.destroy({
      where: { offer_id: id }
    })

    //   - luego añadimos las nuevas (o todas si el array quedó vacío)
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

    // 5) Devolver la oferta actualizada
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

  async findAllByEstablishmentID(establishmentId, role) {
    const whereOffer = { establishment_id: establishmentId }
    const roleFilter = role ? { name: role } : undefined

    const offers = await this.model.findAll({
      where: whereOffer,
      include: [
        {
          model: StudentRoles,
          as: 'student_roles',
          through: { attributes: [] },
          required: !!roleFilter,
          where: roleFilter
        },
        {
          model: Establishments,
          attributes: ['establishment_name'], 
          required: false
        }
      ]
    })

    const enriched = await Promise.all(
      offers.map(async inst => {
        const offer = inst.get({ plain: true })
        if (offer.offer_image) {
          offer.offer_image = await generateSignedUrl(offer.offer_image, 7200)
        }
        return offer
      })
    )

    return enriched
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
}

export default OffersService;

import { Administrators } from "../database/models/administrators.model.js";
import { Establishments } from "../database/models/establishments.model.js";
import { Students } from "../database/models/students.model.js";
import { Users } from "../database/models/users.model.js";
import { uploadImage } from "../utils/savePicture.js";
import { generateSignedUrl } from "../utils/signedUrl.js";
import BaseService from "./base.service.js";

const ROLE = {
  ADMIN:         0,
  ESTABLISHMENT: 1,
  STUDENT:       2
}

export default class ProfileService extends BaseService {
  constructor() {
    super(Users)
  }

    async findProfile(id) {
    const user = await this.model.findByPk(id, {
      attributes: { exclude: ['password'] }
    })
    if (!user) {
      const err = new Error('User not found')
      err.status = 404
      throw err
    }

    const include = []
    switch (user.role_id) {
      case ROLE.ADMIN:
        include.push({ model: Administrators,  as: 'administrator' })
        break
      case ROLE.ESTABLISHMENT:
        include.push({ model: Establishments,  as: 'establishment' })
        break
      case ROLE.STUDENT:
        include.push({ model: Students,        as: 'student' })
        break
    }

    const profileInstance = await this.model.findOne({
      where:      { id },
      attributes: { exclude: ['password'] },
      include
    })

    const profile = profileInstance.get({ plain: true })

    if (profile.administrator?.profile_photo) {
      profile.administrator.profile_photo = await generateSignedUrl(
        profile.administrator.profile_photo,
        7200
      )
    }
    if (profile.establishment?.profile_photo) {
      profile.establishment.profile_photo = await generateSignedUrl(
        profile.establishment.profile_photo,
        7200
      )
    }
    if (profile.student?.profile_photo) {
      profile.student.profile_photo = await generateSignedUrl(
        profile.student.profile_photo,
        7200
      )
    }

    return profile
  }

  async updateAdminProfile(id, data, fileBuffer, fileMeta) {
    if (fileBuffer && fileMeta) {
      const imageKey = await uploadImage(
        fileBuffer,
        fileMeta,
        id.toString(),
        'admin'
      )
      data.profile_photo = imageKey
    }

    const { email, ...adminData } = data

    if (email) {
      await super.update(id, { email })
    }

    await Administrators.update(
      adminData,
      { where: { user_id: id } }
    )

    return this.findProfile(id)
  }

  async updateEstablishmentProfile(id, data, fileBuffer, fileMeta) {
    if (fileBuffer && fileMeta) {
      const imageKey = await uploadImage(
        fileBuffer,
        fileMeta,
        id.toString(),
        'establishment'
      );
      data.profile_photo = imageKey;
    }

    const { email, ...estData } = data;

    if (email) {
      await super.update(id, { email });
    }

    await Establishments.update(
      estData,
      { where: { user_id: id } }
    );

    return this.findProfile(id);
  }

  async updateStudentProfile(id, data, fileBuffer, fileMeta) {
    if (fileBuffer && fileMeta) {
      const imageKey = await uploadImage(
        fileBuffer,
        fileMeta,
        id.toString(),
        'student'
      )
      data.profile_photo = imageKey
    }

    const { email, ...studentData } = data

    if (email) {
      await super.update(id, { email })
    }

    await Students.update(
      studentData,
      { where: { user_id: id } }
    )

    return this.findProfile(id)
  }
  
}
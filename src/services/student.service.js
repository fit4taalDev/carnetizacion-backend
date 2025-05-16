import { Users } from "../database/models/users.model.js";
import { Students } from "../database/models/students.model.js";
import bcrypt from 'bcrypt';
import BaseService from "./base.service.js";
import { sequelize } from "../database/sequelize.js";
import { generateQRCode } from "../utils/generateQR.utils.js";
import { StudentRoles } from "../database/models/studentRoles.model.js";
import { uploadImage } from "../utils/savePicture.js";
import { Programs } from "../database/models/programs.model.js";
import { Op, QueryTypes } from 'sequelize';
import { Storage } from "@google-cloud/storage";
import { generateSignedUrl } from "../utils/signedUrl.js";
import { OfferRedemptions } from "../database/models/offerRedemptions.js";
import { Offers } from "../database/models/offers.model.js";
import { Establishments } from "../database/models/establishments.model.js";

const storage = new Storage({ keyFilename: process.env.KEY_FILE_NAME });
const bucket  = storage.bucket(process.env.GCP_BUCKET_NAME);


class StudentService extends BaseService {
    constructor() {
        super(Students);
    }

    async checkIfExistIn(model, field, value, message, options = {}) {
        const existing = await model.findOne({ where: { [field]: value }, ...options });
        if (existing) {
            throw new Error(message);
        }
    }

    async createStudent(data, fileBuffer, fileMeta) {

        return sequelize.transaction(async (t) => {
          const genericPassword = data.student_id + '#';
          const userData = {
            email:    data.email.toLowerCase(),
            password: await bcrypt.hash(genericPassword, 10),
            role_id:  2
          };
    
          await this.checkIfExistIn(Users, 'email', data.email, 'The email address is already registered', { transaction: t });
          await this.checkIfExistIn( Students, 'phone_number', data.phone_number, 'The phone number is already registered', { transaction: t });
          await this.checkIfExistIn( Students, 'student_id', data.student_id, 'The student_id is already registered', { transaction: t });
    
          const newUser = await Users.create(userData, { transaction: t });
    
          const qrCodeUrl = await generateQRCode(data.student_id);

          let profilePath = null;
          if (fileBuffer && fileMeta) {
            profilePath = await uploadImage(fileBuffer, fileMeta,data.student_id ,'student');
          }
      
          const newStudentData = {
            ...data,
            id:newUser.id,
            user_id: newUser.id,
            qr_img: qrCodeUrl,
            profile_photo:profilePath 
          };
    
          const newStudent = await Students.create(newStudentData, { transaction: t });
          return newStudent;
        });
      }

      async findAllStudents(role, fullname, active, programId, dateFrom, dateTo, page = 1, pageSize = 10) {
      const whereStudents = {};
      if (fullname) {
        whereStudents.fullname = { [Op.iLike]: `%${fullname}%` };
      }
      if (active === 'true')       whereStudents.active = true;
      else if (active === 'false') whereStudents.active = false;
      if (programId != null && !isNaN(programId)) {
        whereStudents.program_id = programId;
      }
      if (dateFrom || dateTo) {
        whereStudents.createdAt = {};
        if (dateFrom) {
          whereStudents.createdAt[Op.gte] = new Date(dateFrom);
        }
        if (dateTo) {
          const end = new Date(dateTo);
          end.setHours(23,59,59,999);
          whereStudents.createdAt[Op.lte] = end;
        }
      }

      const studentRolesInclude = {
        model: StudentRoles,
        attributes: ['name'],
        required: Boolean(role),
        ...(role && { where: { name: role } })
      };

      const offset = (page - 1) * pageSize;

      const { count: totalItems, rows } = await Students.findAndCountAll({
        where: whereStudents,
        order: [['student_id', 'DESC']],  
        limit: pageSize,
        offset,
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM public.offer_redemptions AS ordr
                WHERE ordr.student_id = "students"."id"
              )`),
              'offerRedemptionsCount'
            ]
          ],
          exclude: ['user_id', 'student_role_id', 'program_id']
        },
        include: [
          { model: Users, attributes: ['email'] },
          studentRolesInclude,
          { model: Programs, attributes: ['name'] }
        ]
      });

    const enriched = await Promise.all(
        rows.map(async inst => {
          const student = inst.get({ plain: true });
          if (student.qr_img) {
            student.qr_img = await generateSignedUrl(student.qr_img, 7200);
          }
          if (student.profile_photo) {
            student.profile_photo = await generateSignedUrl(student.profile_photo, 7200);
          }
          return student;
        })
    );

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: enriched,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages
      }
    };
  }

    
  async findById(id, page = 1, pageSize = 10) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0, 23, 59, 59, 999
      );
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);

      // Obtener estudiante con rol y usuario
      const inst = await this.model.findOne({
        where: { id },
        include: [
          { model: StudentRoles, attributes: ['id', 'name'] },
          { model: Users, attributes: ['email'] }
        ],
        attributes: { exclude: ['user_id'] }
      });
      if (!inst) return null;
      const student = inst.get({ plain: true });

      // Firmar URLs de imágenes
      if (student.qr_img) {
        student.qr_img = await generateSignedUrl(student.qr_img, 7200);
      }
      if (student.profile_photo) {
        student.profile_photo = await generateSignedUrl(student.profile_photo, 7200);
      }

      // ID de rol del estudiante
      const roleId = student.student_role_id;

      // Total de cupones redimidos este mes
      const [usedRow] = await sequelize.query(
        `
        SELECT COUNT(*) AS coupons_this_month
          FROM public.offer_redemptions
        WHERE student_id = :studentId
          AND "createdAt" BETWEEN :start AND :end
        `,
        {
          replacements: {
            studentId: id,
            start: startOfMonth,
            end: endOfMonth
          },
          type: QueryTypes.SELECT
        }
      );
      const couponsThisMonth = parseInt(usedRow.coupons_this_month, 10);

      // Total de cupones disponibles (no expirados y por rol)
      const [availableRow] = await sequelize.query(
        `
        SELECT COUNT(DISTINCT osr.offer_id) AS total_available
          FROM public.offer_student_role osr
          JOIN public.offers o
            ON o.id = osr.offer_id
        WHERE osr.student_role_id = :roleId
          AND o.end_date >= :now
        `,
        {
          replacements: { roleId, now },
          type: QueryTypes.SELECT
        }
      );
      const totalAvailable = parseInt(availableRow.total_available, 10);

      // Cupones que vencen en los próximos 7 días
      const [soonRow] = await sequelize.query(
        `
        SELECT COUNT(*) AS expiring_soon_count
          FROM public.offer_redemptions orr
          JOIN public.offers o
            ON o.id = orr.offer_id
          JOIN public.offer_student_role osr
            ON osr.offer_id = o.id
        WHERE orr.student_id = :studentId
          AND osr.student_role_id = :roleId
          AND o.end_date BETWEEN :now AND :nextWeek
        `,
        {
          replacements: {
            studentId: id,
            roleId,
            now,
            nextWeek
          },
          type: QueryTypes.SELECT
        }
      );
      const expiringSoonCount = parseInt(soonRow.expiring_soon_count, 10);

      // Total de cupones usados en toda la vida
      const [totalRow] = await sequelize.query(
        `
        SELECT COUNT(*) AS total_coupons_used
          FROM public.offer_redemptions
        WHERE student_id = :studentId
        `,
        {
          replacements: { studentId: id },
          type: QueryTypes.SELECT
        }
      );
      const totalCouponsUsed = parseInt(totalRow.total_coupons_used, 10);

      // Nivel de uso: bajo/medio/alto según cupones usados este mes vs disponibles
      const ratio = totalAvailable > 0
        ? couponsThisMonth / totalAvailable
        : 0;
      let usageLevel = 'Low';
      if (ratio >= 0.66) {
        usageLevel = 'High';
      } else if (ratio >= 0.33) {
        usageLevel = 'Medium';
      }

      // Paginación de redenciones
      const offset = (page - 1) * pageSize;
      const { count: totalItems, rows: redemptionRows } = await OfferRedemptions.findAndCountAll({
        where: { student_id: id },
        limit: pageSize,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Offers,
            attributes: [
              'establishment_id',
              'title',
              'normal_price',
              'discount_price',
              'end_date'
            ],
            include: [
              { model: Establishments, attributes: ['establishment_name'] }
            ]
          }
        ]
      });
      const redemptions = redemptionRows.map(r => r.get({ plain: true }));
      const totalPages = Math.ceil(totalItems / pageSize);

      student.couponsThisMonth = couponsThisMonth;
      student.totalAvailable = totalAvailable;
      student.couponUsageLevel = usageLevel;
      student.expiringSoonCount = expiringSoonCount;
      student.totalCouponsUsed = totalCouponsUsed;
      student.redemptions = redemptions;
      student.pagination = { page, pageSize, totalPages, totalItems };

      return student;
    }
}

export default StudentService;

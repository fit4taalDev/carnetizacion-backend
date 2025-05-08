import multer from "multer";
import EstablishmentService from "../services/establishment.service.js";
import { generateSignedUrl } from "../utils/signedUrl.js";


const service = new EstablishmentService()

class EstablishmentController{
    async createEstablishment(req, res, next) {
        try {
          const data = req.body;
          const file = req.file;
          const fileBuffer = file ? file.buffer : null;
          const fileMeta = file
            ? { filename: file.originalname, mimetype: file.mimetype }
            : null;
    
          const newEstablishment = await service.createEstablishment(
            data,
            fileBuffer,
            fileMeta
          );
    
          let profileUrl = null;
          if (newEstablishment.profile_photo) {
            profileUrl = await generateSignedUrl(
              newEstablishment.profile_photo,);
          }
    
          return res.status(201).json({
            message: 'Establishment successfully created',
            newEstablishment: {
              ...newEstablishment.get({ plain: true }),
              profile_photo: profileUrl
            }
          });
        } catch (err) {
          if (err instanceof multer.MulterError) {
            const msg =
              err.code === 'LIMIT_FILE_SIZE'
                ? 'The file must not be larger than 200 KB.'
                : err.code === 'LIMIT_UNEXPECTED_FILE'
                ? err.message
                : 'Error processing the image.';
            return res.status(400).json({ error: msg });
          }
          next(err);
        }
      }

    async findAllEstablishments (req, res, next){
        try{
            const role = req.query.role?.toString().trim()
            const establishment_name = req.query.establishment_name ? req.query.establishment_name.toString().trim() : undefined;
            const status = req.query.status?.toString().trim();

            const dateFrom = req.query.dateFrom || req.query.date_from;
            const dateTo   = req.query.dateTo   || req.query.date_to;

            const establishmentRaw = req.query.establishment_id ?? req.query.establishment;

            let establishment;
            if (establishmentRaw !== undefined && establishmentRaw !== '') {
              establishment = parseInt(establishmentRaw.toString(), 10);
              if (isNaN(establishment)) {
                return res.status(400).json({ message: 'establishment_id debe ser un entero válido' });
              }
            }

            const establishments = await service.findAllEstablishments(role, establishment_name, status, dateFrom, dateTo, establishment)
            return res.status(200).json(establishments)
        }catch (error) {
            next(error);
        }
    }

    async findEstablishmentById (req, res, next){
        const {id} = req.params
        try{
            const establishment = await service.findById(id)
            return res.status(200).json(establishment)
        }catch (error) {
            next(error);
        }
    }
}

export default EstablishmentController
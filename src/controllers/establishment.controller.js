import multer from "multer";
import EstablishmentService from "../services/establishment.service.js";
import { generateSignedUrl } from "../utils/savePicture.js";

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
              newEstablishment.profile_photo,
              60 * 60
            );
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

            const establishments = await service.findAllEstablishments(role)
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
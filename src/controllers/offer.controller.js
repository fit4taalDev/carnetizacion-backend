import multer from "multer";
import OffersService from "../services/offers.service.js";
import { generateSignedUrl } from "../utils/signedUrl.js";
const service = new OffersService()

class OfferController{
    async createOffer(req, res, next) {
        try {

            let roles = req.body.student_role_ids
            if (!roles) {
            roles = []
            } else if (!Array.isArray(roles)) {

            roles = [roles]
            }

            roles = roles.map(r => Number(r))

            const data = {
            ...req.body,
            establishment_id: req.user.id,
            student_role_ids: roles
            }

            const file      = req.file
            const fileBuffer = file ? file.buffer : null
            const fileMeta   = file
            ? { filename: file.originalname, mimetype: file.mimetype }
            : null

            const newOffer = await service.create(data, fileBuffer, fileMeta)

            let imageUrl = null
            if (newOffer.image) {
            imageUrl = await generateSignedUrl(newOffer.image, 7200)
            }
            
            return res.status(201).json({
            message: 'Offer successfully created',
            newOffer: {
                ...newOffer.get({ plain: true }),
                image: imageUrl
            }
            })
        } catch (err) {
            if (err instanceof multer.MulterError) {
            const msg = err.code === 'LIMIT_FILE_SIZE'
                ? 'The file must not be larger than 200 KB.'
                : err.code === 'LIMIT_UNEXPECTED_FILE'
                ? err.message
                : 'Error processing the image.'
            return res.status(400).json({ error: msg })
            }
            next(err)
        }
    }

    async updateOffer(req, res, next) {
        try {
          // 1) Normalizar student_role_ids a number[]
          let roles = req.body.student_role_ids
          if (!roles) {
            roles = []
          } else if (!Array.isArray(roles)) {
            roles = [roles]
          }
          roles = roles.map(r => Number(r))
    
          // 2) Preparar data
          const data = {
            ...req.body,
            establishment_id: req.user.id,
            student_role_ids: roles
          }
    
          // 3) Extraer imagen (si viene)
          const file       = req.file
          const fileBuffer = file ? file.buffer : null
          const fileMeta   = file
            ? { filename: file.originalname, mimetype: file.mimetype }
            : null
    
          // 4) Llamar al servicio de actualización
          const updatedOffer = await service.update(
            req.params.id,
            data,
            fileBuffer,
            fileMeta
          )
    
          // 5) Firmar la URL de la imagen si existe
          let imageUrl = null
          if (updatedOffer.offer_image) {
            imageUrl = await generateSignedUrl(updatedOffer.offer_image, 7200)
          }
    
          // 6) Responder
          return res.status(200).json({
            message: 'Offer successfully updated',
            offer: {
              ...updatedOffer.get({ plain: true }),
              offer_image: imageUrl
            }
          })
        } catch (err) {
          if (err instanceof multer.MulterError) {
            const msg = err.code === 'LIMIT_FILE_SIZE'
              ? 'The file must not be larger than 200 KB.'
              : err.code === 'LIMIT_UNEXPECTED_FILE'
                ? err.message
                : 'Error processing the image.'
            return res.status(400).json({ error: msg })
          }
          next(err)
        }
      }

    async findAllOffers (req, res, next) {
        const role = req.query.role?.toString().trim()
        try{
            const offers = await service.findAll(role)
            return res.status(200).json(offers)

        }catch (error) {
            next(error);
        }
    }

    async findAllOffersByEstablishmentId (req, res, next) {
        const establishment_id = req.params.id
        const role = req.query.role?.toString().trim()
        try{
            const offers = await service.findAllByEstablishmentID(establishment_id, role)
            return res.status(200).json(offers)

        }catch (error) {
            next(error);
        }
    }


    async findOfferById (req, res, next){
        const {id} = req.params
        try{
            const offer = await service.findById(id)
            return res.status(200).json(offer)
        }catch (error) {
            next(error);
        }
    }
}

export default OfferController
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
    
          const file       = req.file
          const fileBuffer = file ? file.buffer : null
          const fileMeta   = file
            ? { filename: file.originalname, mimetype: file.mimetype }
            : null
    
          const updatedOffer = await service.update(
            req.params.id,
            data,
            fileBuffer,
            fileMeta
          )
    
          let imageUrl = null
          if (updatedOffer.offer_image) {
            imageUrl = await generateSignedUrl(updatedOffer.offer_image, 7200)
          }
    
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

    async findAllByEstablishment(req, res, next) {
        try {
          const establishmentId = req.user.id 
          const search = req.query.search?.toString().trim()  
          const role = req.query.role?.toString().trim()
          const activeParam = req.query.active?.toString().trim();
          let active;
          if (activeParam === 'true')  active = true;
          else if (activeParam === 'false') active = false;

          const dateFrom = req.query.dateFrom || req.query.date_from;
          const dateTo   = req.query.dateTo   || req.query.date_to;


          const offers = await service.findAllByEstablishment(establishmentId, role, search, active, dateFrom, dateTo)
          return res.status(200).json(offers)
        } catch (err) {
          next(err)
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

    async updateActive (req, res, next){
        try{
            const id = req.params.id
            await service.updateActive(id);
            return res.status(200).json({ message: 'Status successfully updated' });
        }catch (error) {
            next(error);
        }

    }
 }

export default OfferController
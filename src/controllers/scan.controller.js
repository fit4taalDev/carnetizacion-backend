import ScanService from "../services/scans.service.js";
import CryptoJS from 'crypto-js';


const service = new ScanService()

const SECRET_KEY   = process.env.QR_KEY;

class ScanController{
    async create (req, res, next){
        try{
            const body = req.body
            const { student_id, sig } = req.body;

            const expectedSig = CryptoJS
            .HmacSHA256(student_id, SECRET_KEY)
            .toString(CryptoJS.enc.Base64);

            if (sig !== expectedSig) {
                return res.status(401).json({ message: 'Invalid QR signature' });
            }

            const establishment_id = req.user.id
            const data = {...body, establishment_id:establishment_id}
            const newScan = await service.create(data)
            return res.status(201).json({
                message:'Benefit successfully implemented',
                newScan: newScan
            }) 
        }catch (error) {
            next(error);
        }
    }

    async findAllByEstablishment (req, res, next){
        try{
            const scansByEstablishments = await service.findAllScansByEstablishment()
            return res.status(200).json(scansByEstablishments)

        }catch (error) {
            next(error);
        }
    }

    async findAllByEstablishmentId (req, res, next){
        try{
            const {id} = req.params
            const scansByEstablishmentsId = await service.findAllScansByEstablishmentId(id)
            return res.status(200).json(scansByEstablishmentsId)

        }catch (error) {
            next(error);
        }
    }

    async findAllByStudentId (req,res,next){
        try{
            const {id} = req.params
            const scansByStundentId = await service.findAllByEstudentId(id)
            return res.status(200).json(scansByStundentId)

        }catch (error) {
            next(error);
        }
    }

}

export default ScanController
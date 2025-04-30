import ScanService from "../services/scans.service.js";


const service = new ScanService()

class ScanController{
    async create (req, res, next){
        try{
            const body = req.body
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
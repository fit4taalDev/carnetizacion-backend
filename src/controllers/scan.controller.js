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
}

export default ScanController
import ProfileService from "../services/profile.service.js";

const service = new ProfileService()

class ProfileController{
    async findProfile(req, res, next){
        try{
            const id = req.user.id

            const admin = await service.findProfile(id)

            return res.status(200).json(admin)

        }catch (error) {
            next(error);
        }
    }
}

export default ProfileController
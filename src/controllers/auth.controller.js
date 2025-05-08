import AuthService from "../services/auth.service.js";
import { generateSignedUrl } from "../utils/signedUrl.js";

const service = new AuthService()

class AuthController{
    async login(req, res, next) {
        try {
          const { user, token } = await service.login(req.body);
      
          const { administrator, student, establishment } = user;
          const profile = administrator || student || establishment;
      
          const sub_role = profile.student_role_id ?? profile. establishment_role_id 
          const fullname      = profile.fullname ?? profile.establishment_name;
          let profile_photo = null
          if (profile.profile_photo) {
            profile_photo = await generateSignedUrl(profile.profile_photo, 7200)
          }
      
          return res.status(201).json({
            message: 'Login succesful',
            user: {
              id: user.id,
              email: user.email,
              role: user.role.name,
              first_time: user.first_time,
              fullname,
              sub_role,
              profile_photo
            },
            token
          });
        } catch (error) {
          next(error);
        }
      }
    async checkUserExistsByEmail (req, res, next){
        try{
            const { email } = req.body;
            const exists = await service.checkUserExistsByEmail({ email });

            return res.status(200).json({ exists });
        } catch(error){
            next(error)
        }
    }

    async getUserByEmail (req, res, next) {
        try{
            const {email} = req.body
            const apiKey = req.headers["api-key"];

            if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
                return res.status(403).json({ message: "Not authorized" });
            }

            const user = await service.getUserByEmail(email)
            return res.status(200).json(user);

        }catch(error){
            next(error)
        }
    }
 

}

export default AuthController
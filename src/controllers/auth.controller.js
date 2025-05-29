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

    async getUserByEmail(req, res, next) {
      try {
        const { email } = req.body;
        const apiKey    = req.headers['api-key'];

        // 1) Validar API key
        if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
          return res.status(403).json({ message: 'Not authorized' });
        }
        if (!email) {
          return res.status(400).json({ message: 'Email is required' });
        }

        // 2) Obtener user y token desde el servicio
        const { user, token } = await service.getUserByEmail(email);

        // 3) Extraer el perfil asociado
        const { administrator, student, establishment } = user;
        const profile = administrator || student || establishment;
        if (!profile) {
          throw { status: 500, message: 'Profile data missing' };
        }

        // 4) Calcular sub_role, fullname y firmar URL de foto
        const sub_role    = profile.student_role_id   ?? profile.establishment_role_id ?? null;
        const fullname    = profile.fullname          ?? profile.establishment_name   ?? null;
        let profile_photo = null;
        if (profile.profile_photo) {
          profile_photo = await generateSignedUrl(profile.profile_photo, 7200);
        }

        // 5) Devolver mismo formato que login
        return res.status(200).json({
          message: 'Login successful',
          user: {
            id:            user.id,
            email:         user.email,
            role:          user.role.name,
            first_time:    user.first_time,
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

    async forgotPassword (req, res, next){
      try {
          const { email } = req.body;
          if (!email) {
            return res.status(400).json({ message: 'Email is required' });
          }

          const result = await service.sendResetPasswordEmail( email );

          return res.status(200).json(result);
        } catch (error) {
            next(error)
        }
    }

    async resetPassword (req, res, next){
      try {
        const { token, password } = req.body;
        if (!token || !password) {
          return res.status(400).json({ message: 'Token and new password are mandatory' });
        }

        const result = await service.resetPassword({ token, password });
        return res.status(200).json(result);
      } catch (err) {
        next(err);
      }
    }
 

}

export default AuthController
import multer from "multer";
import ProfileService from "../services/profile.service.js";
import { generateSignedUrl } from "../utils/signedUrl.js";

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

async updateAdminProfile(req, res, next) {
    try {
      const id = req.user.id;
      const { fullname, phone_number, email } = req.body;

      const file       = req.file;
      const fileBuffer = file ? file.buffer : null;
      const fileMeta   = file
        ? { filename: file.originalname, mimetype: file.mimetype }
        : null;

      const updatedInstance = await service.updateAdminProfile(
        id,
        { fullname, phone_number, email },
        fileBuffer,
        fileMeta
      );

      const updated = typeof updatedInstance.get === 'function'
        ? updatedInstance.get({ plain: true })
        : updatedInstance;

      if (updated.administrator?.profile_photo) {
        updated.administrator.profile_photo = await generateSignedUrl(
          updated.administrator.profile_photo,
          7200
        );
      }

      return res.status(200).json({
        message: 'Profile updated successfully',
        profile: updated
      });
    } catch (err) {
      if (err instanceof multer.MulterError) {
        const msg = err.code === 'LIMIT_FILE_SIZE'
          ? 'The file must not be larger than 200 KB.'
          : err.code === 'LIMIT_UNEXPECTED_FILE'
            ? err.message
            : 'Error processing the image.';
        return res.status(400).json({ error: msg });
      }
      next(err);
    }
  }

}

export default ProfileController
import PasswordService from "../services/password.service.js";

const service = new PasswordService()

class PasswordController{
   async updatePassword(req, res, next) {
    try {
      const id = req.user.id;
      const { currentPassword, password } = req.body;

      await service.updatePassword(id, currentPassword, password);

      return res
        .status(200)
        .json({ message: "Password updated successfully" });
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      next(err);
    }
  }
}

export default PasswordController
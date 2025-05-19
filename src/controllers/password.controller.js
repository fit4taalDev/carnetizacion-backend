import PasswordService from "../services/password.service.js";

const service = new PasswordService()

class PasswordController{
    async updatePassword(req, res, next){
    try {
        const id = req.user.id;
        const { password } = req.body;

        await service.updatePassword(id, password);

        return res
            .status(200)
            .json({ message: "Password updated successfully" });
        } catch (err) {
        next(err);
        }
    }
}

export default PasswordController
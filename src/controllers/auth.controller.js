import AuthService from "../services/auth.service.js";

const service = new AuthService()

export const loginController = async (req, res, next) => {
    try{
        const body = req.body;
        const {user, token} = await service.login(body)
        return res.status(201).json({
            message:'Login succesful',
            user: {
                id: user.id,
                email: user.email,
                role: user.role.name
            },
            token: token
        })
    } catch(error){
        next(error)
    }
}
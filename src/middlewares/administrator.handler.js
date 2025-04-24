import jwt from "jsonwebtoken";

const administratorHandler = (req, res, next) =>{
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(' ')[1];

    try{
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        if(decoded.role_id === 0){
            req.user = decoded
            next()
        }else{
            return res.status(401).json({ message: "Unauthorized: You do not have the permissions to perform this action" });
        }
    }catch(error){
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
}

export default administratorHandler
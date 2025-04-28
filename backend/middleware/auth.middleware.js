import jwt, { decode } from "jsonwebtoken"
import User from "../models/user.model.js"

const protect = async(req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    {
        try {
            token = req.headers.authorization.replace('Bearer ', '');

        // console.log("Extracted Token:", token); // Debugging

           const decoded =  jwt.verify(token,process.env.JWT_SECRET)
        //    console.log("Decoded Token:", decoded); // Debugging
           req.user = await User.findById(decoded.id).select('-password')

           next()

        } catch (error) {
            res.status(401)
            .json({
                message:"Not authorized Token failed!"
            })
        }
    }
    if(!token){
        res.status(401)
        .json({
         message:"Not authorization no token provided!"
        })
    }
}
export default protect
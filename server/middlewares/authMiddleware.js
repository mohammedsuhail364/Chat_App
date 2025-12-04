import jwt from 'jsonwebtoken'

export const verifyToken=async (req,res,next)=>{
    const token=req.cookies.jwt;
    console.log(token);
    if(!token) return res.status(401).send("You are not authenticated")
    jwt.verify(token,process.env.JWT_KEY,async(err,payload)=>{
if(err) return res.status(403).send("Token Is not valid");
req.userId=payload.userId;
// console.log(req.userId)
next();
})
}
const jwt = require('jsonwebtoken');
const httpmessage = require('../utils/htttpmessage');
const appError = require('../utils/appError');


const verifytoken = (req,res,next)=>{
    const authHeader = req.headers['Authorization'] || req.headers['authorization'];
    if(!authHeader){
        const error = appError.create("token is required",401);
        return next(error);
    }
    const token = authHeader.split(' ')[1];
    try{
        const curruser= jwt.verify(token,process.env.JWT_SECRET);
        req.user=curruser;
        next();
    }catch(err){
        const error = appError.create("token is invalid",401);
        return next(error);
    }
}

module.exports=verifytoken;
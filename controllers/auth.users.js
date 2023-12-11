const User = require('../models/user');
const { body,validationResult} = require('express-validator');
const appError = require('../utils/appError');
const bcrypt = require('bcrypt');
const httpmessage = require('../utils/htttpmessage');
const jwt = require('../config/jwt');
const verifyid = require('../utils/verifymongoid');
const refreshtoken= require('../config/refreshJwt');
const jwt_token = require('jsonwebtoken');
const asyncWrapper = require('../middlewares/asyncWrapper');
const sendEmail = require('../utils/email');
const crypto = require('crypto');



//regiser
const registerUser = asyncWrapper(async (req,res,next)=>{
    const {firstname , lastname , email , mobile , password} = req.body;
    const err=validationResult(req);
    if(!err.isEmpty()){
        const message=err.array();
        const statusCode = 400;
        const error = appError.create(message,statusCode);
        return next(error);
    }
    const user = await User.findOne({email:email});
    if(user){
        const error = appError("user already exist",400);
        return next(error);
    }
    const hashedpassword = await bcrypt.hash(String(password),10);
    const newUser = new User({
        firstname,
        lastname,
        email,
        mobile,
        password:hashedpassword
    });
    await newUser.save();
    const userData = {
        firstname,
        lastname,
        email,
        mobile,
        role:newUser.role
    }
    res.status(201).json({status:httpmessage.SUCCESS,data:{userData}});
})


//login
const loginUser = asyncWrapper(async (req,res,next)=>{
    const {email,password} = req.body;
    const err=validationResult(req);
    if(!err.isEmpty()){
        const message=err.array();
        const statusCode = 400;
        const error = appError.create(message,statusCode);
        return next(error);
    }
    const user = await User.findOne({email:email});
    if(!user){
        const error = appError.create("invalid username or password",400);
        return next(error);
    }
    const result = await bcrypt.compare(String(password),user.password);
    if(!result){
        const error = appError.create("invalid username or password",400);
        return next(error);
    }
    const access_token = jwt.generateToken(user._id,user.firstname,user.role);
    const reftoken = refreshtoken.generateRefreshToken(user._id,user.firstname,user.role);
    await User.findByIdAndUpdate(user._id,{token:reftoken});
    res.cookie('refreshToken',reftoken,{
        httpOnly:true,
        maxAge:72*60*60*1000
    });
    user.token=access_token;
    const userData = {
        firstname:user.firstname,
        lastname:user.lastname,
        email:user.email,
        mobile:user.mobile,
        role:user.role,
        token:user.token
    };
    res.status(200).json({status:httpmessage.SUCCESS,data:{userData}});
});


//admin login
const loginAdmin = asyncWrapper(async (req,res,next)=>{
    const {email,password} = req.body;
    const err=validationResult(req);
    if(!err.isEmpty()){
        const message=err.array();
        const statusCode = 400;
        const error = appError.create(message,statusCode);
        return next(error);
    }
    const user = await User.findOne({email:email});
    if(user.role!=="admin") return next(appError.create("Not Authoraized",400));
    if(!user){
        const error = appError.create("invalid username or password",400);
        return next(error);
    }
    const result = await bcrypt.compare(String(password),user.password);
    if(!result){
        const error = appError.create("invalid username or password",400);
        return next(error);
    }
    const access_token = jwt.generateToken(user._id,user.firstname,user.role);
    const reftoken = refreshtoken.generateRefreshToken(user._id,user.firstname,user.role);
    await User.findByIdAndUpdate(user._id,{token:reftoken});
    res.cookie('refreshToken',reftoken,{
        httpOnly:true,
        maxAge:72*60*60*1000
    });
    user.token=access_token;
    const userData = {
        firstname:user.firstname,
        lastname:user.lastname,
        email:user.email,
        mobile:user.mobile,
        role:user.role,
        token:user.token
    };
    res.status(200).json({status:httpmessage.SUCCESS,data:{userData}});
});


//block user
const blockUser = asyncWrapper(async(req,res,next)=>{
    const id = req.params.userId;
    verifyid(id);
    const user = await User.findByIdAndUpdate(id,{$set:{isBloked:true}});
    if(!user){
        const error = appError.create("invalid user id",400);
        return next(error);
    }
    res.status(200).json({status:httpmessage.SUCCESS});

})


//unblock user
const unblockUser = asyncWrapper(async(req,res,next)=>{
    const id = req.params.userId;
    verifyid(id);
    const user = await User.findByIdAndUpdate(id,{$set:{isBloked:false}});
    if(!user){
        const error = appError.create("invalid user id",400);
        return next(error);
    }
    res.status(200).json({status:httpmessage.SUCCESS});
})

//refresh token route
const handelRefreshToken = asyncWrapper(async (req,res,next)=>{
    const {refreshToken} = req.cookies;
    if(!refreshToken) return next(appError.create('missing token',401));
    const user = await User.findOne({token:refreshToken});
    if(!user) return next(appError.create('invalid token',401));
    jwt_token.verify(refreshToken,process.env.JWT_SECRET,(err,us)=>{
        if(err || us.id!=user._id){
            return next(appError.create('not authorized',403));
        }
        const access_token = jwt.generateToken(user._id,user.name,user.role);
        res.json({token:access_token});
    })
})


//logout
const logout = asyncWrapper(async (req,res,next)=>{
    const {refreshToken} = req.cookies;
    if(!refreshToken) return next(appError.create('missing token',401));
    const user = await User.findOne({token:refreshToken});
    if(!user){
        res.clearCookie("refreshToken",{
            httpOnly:true,
            secure:true
        });
        return res.sendStatus(204);
    };
    await User.findOneAndUpdate({token:refreshToken},{
        token:""
    })
    res.clearCookie("refreshToken",{
        httpOnly:true,
        secure:true
    });
    return res.sendStatus(204);
})

//update user password
const UpdatePassword = asyncWrapper(async (req,res,next)=>{
    const {id} = req.user;
    const {password} = req.body;
    if(!password){
        return next(appError.create('password is missing',500));
    }
    const hashedpassword = await bcrypt.hash(String(password),10);
    const user = await User.findByIdAndUpdate(id,{$set:{password:hashedpassword}},{new:true});
    if(!user)return next(appError.create('user not found',500));
    res.status(200).json({status:httpmessage.SUCCESS});
})



//forgot password token
const forgotPasswordToken = asyncWrapper(async (req,res,next)=>{
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user)return next(appError.create('email not found',404));
    const token = user.CreatePasswordResetToken();
    await user.save();
    const resetURL = `${req.protocol}://${req.get('host')}/api/user/reset-password/${token}`;
    const message = `we have receved a password request please reset your password by clicking on the link bleow\n\n${resetURL}`;
    try{
        await sendEmail({
            email:user.email,
            subject:'password change request',
            message:message
        })
        res.status(200).json({status:"success",message:"email has sent successfully"});
    }catch{
        return next(appError.create('email does not sent',404));
    }
    
});


//reset password
const resetPassword = asyncWrapper(async (req,res,next)=>{
   
    const token = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() },
    });
    if(!user) return next(appError.create('token is invalid or expired',404));

    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;
    user.passwordChangedAt=Date.now();

    const {password , confirmPassword}=req.body;
    if(password===confirmPassword){
        const hashedpassword = await bcrypt.hash(String(password),10);
        const done = await User.findByIdAndUpdate(user.id,{$set:{password:hashedpassword}},{new:true});
        if(!done)return next(appError.create('user not found',500));
        await user.save();
        const access_token = jwt.generateToken(user.id,user.firstname,user.role);
        const reftoken = refreshtoken.generateRefreshToken(user.id,user.firstname,user.role);
        await User.findByIdAndUpdate(user._id,{token:reftoken});
        res.cookie('refreshToken',reftoken,{
            httpOnly:true,
            maxAge:72*60*60*1000
        });
        const userData = {
            firstname:user.firstname,
            lastname:user.lastname,
            email:user.email,
            mobile:user.mobile,
            role:user.role,
            token:access_token
        };
        res.status(200).json({status:httpmessage.SUCCESS,data:{userData}});
    }else{
        return next(appError.create('password does not match',500));
    }
})



module.exports = {
    registerUser,
    loginUser,
    blockUser,
    unblockUser,
    handelRefreshToken,
    logout,
    UpdatePassword,
    forgotPasswordToken,
    resetPassword,
    loginAdmin
}
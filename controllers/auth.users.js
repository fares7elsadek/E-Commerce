const User = require('../models/user');
const { body,validationResult} = require('express-validator');
const appError = require('../utils/appError');
const bcrypt = require('bcrypt');
const httpmessage = require('../utils/htttpmessage');
const jwt = require('../config/jwt');
const verifyid = require('../utils/verifymongoid');
const asyncWrapper = require('../middlewares/asyncWrapper');



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
    const token = jwt.generateToken(user._id,user.firstname,user.role);
    user.token=token;
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


module.exports = {
    registerUser,
    loginUser,
    blockUser,
    unblockUser
}
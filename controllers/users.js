const User = require('../models/user');
const asyncWrapper = require('../middlewares/asyncWrapper');
const httpmessage = require('../utils/htttpmessage');
const verifyid = require('../utils/verifymongoid');
const appError = require('../utils/appError');



//get all users
const getAllUsers  = asyncWrapper(async(req,res,next)=>{
    const query = req.query;
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page-1)*limit;
    const users=await User.find({},{'__v':false,'password':false}).limit(limit).skip(skip);
    res.json({status:httpmessage.SUCCESS,data:{users}});
});



//get a single user
const getSingleUser  = asyncWrapper(async(req,res,next)=>{
    const id = req.params.userId;
    verifyid(id);
    const user = await User.findById(id,{'password':false,'__v':false});
    if(!user){
        const error = appError.create("invalid user id",400);
        return next(error);
    }
    res.status(200).json({status:httpmessage.SUCCESS,data:{user}});
});


//delete a user
const deleteUser  = asyncWrapper(async(req,res,next)=>{
    const id = req.params.userId;
    verifyid(id);
    const done = await User.findByIdAndDelete(id);
    if(!done){
        const error = appError.create("invalid user id",400);
        return next(error);
    }
    res.status(200).json({
        ststus:httpmessage.SUCCESS,
        data:null
    });
});


//update a user
const UpdateUser  = asyncWrapper(async(req,res,next)=>{
    const id = req.params.userId;
    verifyid(id);
    const user = await User.findByIdAndUpdate(id,{$set:{...req.body}});
    if(!user){
        const error = appError.create("invalid user id",400);
        return next(error);
    }
    res.status(200).json({status:httpmessage.SUCCESS});
});


module.exports = {
    getAllUsers,
    getSingleUser,
    deleteUser,
    UpdateUser
}




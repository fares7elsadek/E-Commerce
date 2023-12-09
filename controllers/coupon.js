const Coupon = require('../models/coupon');
const asyncWrapper = require('../middlewares/asyncWrapper');
const httpmessage = require('../utils/htttpmessage');
const verifyid = require('../utils/verifymongoid');
const appError = require('../utils/appError');
const { body,validationResult} = require('express-validator');


//get all Coupones
const getAllCoupones  = asyncWrapper(async(req,res,next)=>{
    const coupon=await Coupon.find({},{'__v':false});
    res.json({status:httpmessage.SUCCESS,data:{coupon}});
});

//get a single Coupon
const getSingleCoupon  = asyncWrapper(async(req,res,next)=>{
    const id = req.params.couponId;
    verifyid(id);
    const coupon = await Coupon.findById(id,{'__v':false});
    if(!coupon){
        const error = appError.create("invalid coupon id",400);
        return next(error);
    }
    res.status(200).json({status:httpmessage.SUCCESS,data:{coupon}});
});


//delete a Coupon
const deleteCoupon  = asyncWrapper(async(req,res,next)=>{
    const id = req.params.couponId;
    verifyid(id);
    const done = await Coupon.findByIdAndDelete(id);
    if(!done){
        const error = appError.create("invalid Coupon id",400);
        return next(error);
    }
    res.status(200).json({
        ststus:httpmessage.SUCCESS,
        data:null
    });
});


//update a Coupon
const UpdateCoupon  = asyncWrapper(async(req,res,next)=>{
    const id = req.params.couponId;
    verifyid(id);
    const coupon = await Coupon.findByIdAndUpdate(id,{$set:{...req.body}});
    if(!coupon){
        const error = appError.create("invalid coupon id",400);
        return next(error);
    }
    res.status(200).json({status:httpmessage.SUCCESS});
});

//create new Coupon
const CreateCoupon = asyncWrapper(async (req,res,next)=>{
    const err=validationResult(req);
    if(!err.isEmpty()){
        const message=err.array();
        const statusCode = 400;
        const error = appError.create(message,statusCode);
        return next(error);
    }
    const coupon = new Coupon({...req.body});
    await coupon.save();
    res.status(201).json({status:httpmessage.SUCCESS,data:{...req.body}});
})


module.exports = {
    getAllCoupones,
    getSingleCoupon,
    deleteCoupon,
    UpdateCoupon,
    CreateCoupon
}




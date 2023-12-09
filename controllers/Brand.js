const Brand = require('../models/BrandModel');
const asyncWrapper = require('../middlewares/asyncWrapper');
const httpmessage = require('../utils/htttpmessage');
const verifyid = require('../utils/verifymongoid');
const appError = require('../utils/appError');
const { body,validationResult} = require('express-validator');


//get all Categories
const getAllBrands  = asyncWrapper(async(req,res,next)=>{
    const query = req.query;
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page-1)*limit;
    const brand=await Brand.find({},{'__v':false}).limit(limit).skip(skip);
    res.json({status:httpmessage.SUCCESS,data:{brand}});
});



//get a single Brand
const getSingleBrand  = asyncWrapper(async(req,res,next)=>{
    const id = req.params.brandId;
    verifyid(id);
    const brand = await Brand.findById(id,{'__v':false});
    if(!brand){
        const error = appError.create("invalid Brand id",400);
        return next(error);
    }
    res.status(200).json({status:httpmessage.SUCCESS,data:{brand}});
});


//delete a Brand
const deleteBrand  = asyncWrapper(async(req,res,next)=>{
    const id = req.params.brandId;
    verifyid(id);
    const done = await Brand.findByIdAndDelete(id);
    if(!done){
        const error = appError.create("invalid Brand id",400);
        return next(error);
    }
    res.status(200).json({
        ststus:httpmessage.SUCCESS,
        data:null
    });
});


//update a Brand
const UpdateBrand  = asyncWrapper(async(req,res,next)=>{
    const id = req.params.brandId;
    verifyid(id);
    const brand = await Brand.findByIdAndUpdate(id,{$set:{...req.body}});
    if(!brand){
        const error = appError.create("invalid Brand id",400);
        return next(error);
    }
    res.status(200).json({status:httpmessage.SUCCESS});
});

//create new Brand
const CreateBrand = asyncWrapper(async (req,res,next)=>{
    const err=validationResult(req);
    if(!err.isEmpty()){
        const message=err.array();
        const statusCode = 400;
        const error = appError.create(message,statusCode);
        return next(error);
    }
    const brand = new Brand({...req.body});
    await brand.save();
    res.status(201).json({status:httpmessage.SUCCESS,data:{...req.body}});
})


module.exports = {
    getAllBrands,
    getSingleBrand,
    deleteBrand,
    UpdateBrand,
    CreateBrand
}




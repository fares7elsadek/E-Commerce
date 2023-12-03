const Product = require('../models/ProductModel');
const asyncWrapper = require('../middlewares/asyncWrapper');
const { body,validationResult} = require('express-validator');
const httpmessage = require('../utils/htttpmessage');
const verifyid = require('../utils/verifymongoid');
const appError = require('../utils/appError');
const slugify = require('slugify');



//create
const Addproduct = asyncWrapper(async (req,res,next)=>{
    
    const err=validationResult(req);
    if(!err.isEmpty()){
        const message=err.array();
        const statusCode = 400;
        const error = appError.create(message,statusCode);
        return next(error);
    }
    req.body.slug=slugify(req.body.title);
    const product = new Product({...req.body});
    await product.save();
    res.status(201).json({status:httpmessage.SUCCESS,data:{...req.body}});
});


//get single
const Getproduct = asyncWrapper(async (req,res,next)=>{
    const id = req.params.productId;
    verifyid(id);
    const product = await Product.findById(id);
    res.status(200).json({status:httpmessage.SUCCESS,data:{product}});
});

//get all
const GetallProucts = asyncWrapper(async (req,res,next)=>{
    const query = req.query;
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page-1)*limit;
    const prodcuts=await Product.find(req.query,{'__v':false,'password':false}).limit(limit).skip(skip);
    res.json({status:httpmessage.SUCCESS,data:{prodcuts}});
});


//delete
const deleteProduct = asyncWrapper(async (req,res,next)=>{
    const id = req.params.productId;
    verifyid(id);
    const done = await Product.findByIdAndDelete(id);
    if(!done){
        const error = appError.create("invalid product id",400);
        return next(error);
    }
    res.status(200).json({
        ststus:httpmessage.SUCCESS,
        data:null
    });
});

//update
const UpdateProduct = asyncWrapper(async (req,res,next)=>{
    const id = req.params.productId;
    verifyid(id);
    if(req.body.title){
        req.body.slug=slugify(req.body.title);
    }
    const product = await Product.findByIdAndUpdate(id,{$set:{...req.body}});
    if(!product){
        const error = appError.create("invalid product id",400);
        return next(error);
    }
    res.status(200).json({status:httpmessage.SUCCESS});
});

module.exports={
    Getproduct,
    Addproduct,
    GetallProucts,
    deleteProduct,
    UpdateProduct
}


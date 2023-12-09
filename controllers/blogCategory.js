const Category = require('../models/blogCategory');
const asyncWrapper = require('../middlewares/asyncWrapper');
const httpmessage = require('../utils/htttpmessage');
const verifyid = require('../utils/verifymongoid');
const appError = require('../utils/appError');
const { body,validationResult} = require('express-validator');


//get all Categories
const getAllCategories  = asyncWrapper(async(req,res,next)=>{
    const query = req.query;
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page-1)*limit;
    const category=await Category.find({},{'__v':false}).limit(limit).skip(skip);
    res.json({status:httpmessage.SUCCESS,data:{category}});
});



//get a single category
const getSingleCategory  = asyncWrapper(async(req,res,next)=>{
    const id = req.params.categoryId;
    verifyid(id);
    const category = await Category.findById(id,{'__v':false});
    if(!category){
        const error = appError.create("invalid category id",400);
        return next(error);
    }
    res.status(200).json({status:httpmessage.SUCCESS,data:{category}});
});


//delete a Category
const deleteCategory  = asyncWrapper(async(req,res,next)=>{
    const id = req.params.categoryId;
    verifyid(id);
    const done = await Category.findByIdAndDelete(id);
    if(!done){
        const error = appError.create("invalid category id",400);
        return next(error);
    }
    res.status(200).json({
        ststus:httpmessage.SUCCESS,
        data:null
    });
});


//update a category
const UpdateCategory  = asyncWrapper(async(req,res,next)=>{
    const id = req.params.categoryId;
    verifyid(id);
    const category = await Category.findByIdAndUpdate(id,{$set:{...req.body}});
    if(!category){
        const error = appError.create("invalid category id",400);
        return next(error);
    }
    res.status(200).json({status:httpmessage.SUCCESS});
});

//create new Category
const CreateCategory = asyncWrapper(async (req,res,next)=>{
    console.log("hi");
    const err=validationResult(req);
    if(!err.isEmpty()){
        console.log("hi2");
        const message=err.array();
        const statusCode = 400;
        const error = appError.create(message,statusCode);
        return next(error);
    }
    const category = new Category({...req.body});
    await category.save();
    res.status(201).json({status:httpmessage.SUCCESS,data:{...req.body}});
})


module.exports = {
    getAllCategories,
    getSingleCategory,
    deleteCategory,
    UpdateCategory,
    CreateCategory
}




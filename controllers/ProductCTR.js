const Product = require('../models/ProductModel');
const User =require('../models/user');
const asyncWrapper = require('../middlewares/asyncWrapper');
const { body,validationResult} = require('express-validator');
const httpmessage = require('../utils/htttpmessage');
const verifyid = require('../utils/verifymongoid');
const appError = require('../utils/appError');
const cloudinaryUploadImage = require('../utils/cloudinary');
const fs = require('fs');
const slugify = require('slugify');
const { log } = require('console');



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

//add to wishlist
const AddToWishlist = asyncWrapper(async (req,res,next)=>{
    const prodcut_id = req.body.prodId;
    const userId = req.user.id;
    verifyid(prodcut_id);
    const product = await Product.findById(prodcut_id);
    if(!product) return next(appError.create("invalid product id",400));
    const user = await User.findById(userId);
    if(!user) return next(appError.create("Not authorized",400));
    const alreadeyAdded = user.wishlist.find(prodcutId => prodcutId.toString()===prodcut_id.toString());
    if(alreadeyAdded){
       const done= await User.findByIdAndUpdate(userId,{
           $pull:{wishlist:prodcut_id}
       },{new:true,projection: { '__v': 0, 'password': 0 }});
       if(!done){
        return next(appError.create("there's a problem",400));
       }
       res.status(200).json({status:httpmessage.SUCCESS,data:done});
    }else{
        const done= await User.findByIdAndUpdate(userId,{
            $push:{wishlist:prodcut_id}
        },{new:true,projection: { '__v': 0, 'password': 0 }});
        if(!done){
         return next(appError.create("there's a problem",400));
        }
        res.status(200).json({status:httpmessage.SUCCESS,data:done});
    }

});

const AddRating = asyncWrapper(async (req,res,next)=>{
    const userId = req.user.id;
    const {star,comment,prodId}=req.body;
    verifyid(prodId);
    if(!(star >0 && star <=5)) return next(appError.create("invlid number of starts",400));
    const product = await Product.findById(prodId);
    if(!product) return next(appError.create("invalid product id",400));
    const alreadyRated = product.ratings.find(prod => prod.postedby.toString()===userId.toString());
    console.log("hello")
    if(alreadyRated){
        const done = await Product.updateOne(
            {
                ratings:{$elemMatch:alreadyRated}
            },
            {
                $set:{"ratings.$.star":star,"ratings.$.comment":comment}
            },{
                new:true
            }
        )
        if(!done){
            return next(appError.create("there's a problem",400));
           }
    }else{
        const done= await Product.findByIdAndUpdate(prodId,{
            $push:{ratings:{
                star:star,
                comment:comment,
                postedby:userId
            }}
        },{new:true});
        if(!done){
         return next(appError.create("there's a problem",400));
        }
        
    }
    const getAllRatings = await Product.findById(prodId);
    let Ratings = getAllRatings.ratings;
    let sum=0;
    const size = Ratings.length;
    Ratings.forEach((item)=>{
        sum+=item.star;
    });
    const totalrating = Math.round(sum/size);
    const prod = await Product.findByIdAndUpdate(prodId,{
        $set:{totalrating:totalrating}
    },{new:true});
    res.status(200).json({status:httpmessage.SUCCESS,data:prod});
})

//upload image
const UploadImage = asyncWrapper(async(req,res,next)=>{
     const {prodId} = req.params;
     verifyid(prodId);
     try{
          const uploader = (path) => cloudinaryUploadImage(path,"images");
          const urls=[];
          const files=req.files;
          for(const file of files){
            const {path} =file;
            const newpath = await uploader(path);
            urls.push(newpath);
            fs.unlinkSync(path);
          }
          const product = await Product.findByIdAndUpdate(prodId,{
            images:urls.map((file)=>{return file}),
          },{new:true});
          res.json(product);
     }catch(error){
        throw new Error(error);
     }
     
})

module.exports={
    Getproduct,
    Addproduct,
    GetallProucts,
    deleteProduct,
    UpdateProduct,
    AddToWishlist,
    AddRating,
    UploadImage
}


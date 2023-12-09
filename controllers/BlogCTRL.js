const Blog = require('../models/BlogModel');
const asyncWrapper = require('../middlewares/asyncWrapper');
const { body,validationResult} = require('express-validator');
const httpmessage = require('../utils/htttpmessage');
const verifyid = require('../utils/verifymongoid');
const appError = require('../utils/appError');



//create
const AddBlog = asyncWrapper(async (req,res,next)=>{
    const err=validationResult(req);
    if(!err.isEmpty()){
        const message=err.array();
        const statusCode = 400;
        const error = appError.create(message,statusCode);
        return next(error);
    }
    const blog = new Blog({...req.body});
    await blog.save();
    res.status(201).json({status:httpmessage.SUCCESS,data:{blog}});
});


//get single
const GetABlog = asyncWrapper(async (req,res,next)=>{
    const id = req.params.blogId;
    verifyid(id);
    let blog = await Blog.findById(id);
    blog = await Blog.findByIdAndUpdate(id,{$inc:{numViews:1}},{new:true})
    .populate({path:"likes",select:'firstname lastname role email'})
    .populate({path:"dislikes",select:'firstname lastname role email'});
    res.status(200).json({status:httpmessage.SUCCESS,data:{blog}});
});

//get all
const GetallBlogs = asyncWrapper(async (req,res,next)=>{
    const query = req.query;
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page-1)*limit;
    const blogs=await Blog.find(req.query,{'__v':false}).limit(limit).skip(skip);
    res.json({status:httpmessage.SUCCESS,data:{blogs}});
});


//delete
const deleteBlog = asyncWrapper(async (req,res,next)=>{
    const id = req.params.blogId;
    verifyid(id);
    const done = await Blog.findByIdAndDelete(id);
    if(!done){
        const error = appError.create("invalid blog id",400);
        return next(error);
    }
    res.status(200).json({
        ststus:httpmessage.SUCCESS,
        data:null
    });
});

//update
const UpdateBlog = asyncWrapper(async (req,res,next)=>{
    const id = req.params.blogId;
    verifyid(id);
    const blog = await Blog.findByIdAndUpdate(id,{$set:{...req.body}});
    if(!blog){
        const error = appError.create("invalid blog id",400);
        return next(error);
    }
    res.status(200).json({status:httpmessage.SUCCESS});
});


//likes
const likeAblog = asyncWrapper(async (req,res,next)=>{

    const id = req.body.blogId;
    if(!id){
        const error = appError.create("missing blogId paramter",400);
        return next(error);
    }
    console.log(id);
    const userId= req.user.id;
    verifyid(id);
    const blog = await Blog.findById(id);
    if(!blog){
        const error = appError.create("invalid blog id",400);
        return next(error);
    }
   
    const dislike = blog.dislikes.find(user => user.toString()===userId.toString());
    if(dislike){
        const blog = await Blog.findByIdAndUpdate(id,{
            $pull:{dislikes:userId},
            $push:{likes:userId}
        },{new:true});
        if(!blog) return next(appError.create('there is a problem',500));
        return res.status(200).json({status:httpmessage.SUCCESS,blog});
    }
    const isLiked = blog.likes.find(user => user.toString()===userId.toString());
    if(isLiked){
        const blog = await Blog.findByIdAndUpdate(id,{
            $pull:{likes:userId},
        },{new:true});
        if(!blog) return next(appError.create('there is a problem',500));
        return res.status(200).json({status:httpmessage.SUCCESS,blog});
    }else{
        const blog = await Blog.findByIdAndUpdate(id,{
            $push:{likes:userId},
        },{new:true});
        if(!blog) return next(appError.create('there is a problem',500));
        return res.status(200).json({status:httpmessage.SUCCESS,blog});
    }
});


//dislikes
const dislikeAblog = asyncWrapper(async (req,res,next)=>{
    const id = req.body.blogId;
    if(!id){
        const error = appError.create("missing blogId paramter",400);
        return next(error);
    }
    console.log(id);
    const userId= req.user.id;
    verifyid(id);
    const blog = await Blog.findById(id);
    if(!blog){
        const error = appError.create("invalid blog id",400);
        return next(error);
    }
    const like = blog.likes.find(user => user.toString()===userId.toString());
    if(like){
        const blog = await Blog.findByIdAndUpdate(id,{
            $pull:{likes:userId},
            $push:{dislikes:userId}
        },{new:true});
        if(!blog) return next(appError.create('there is a problem',500));
        return res.status(200).json({status:httpmessage.SUCCESS,blog});
    }
    const disLiked = blog.dislikes.find(user => user.toString()===userId.toString());
    if(disLiked){
        const blog = await Blog.findByIdAndUpdate(id,{
            $pull:{dislikes:userId},
        },{new:true});
        if(!blog) return next(appError.create('there is a problem',500));
        return res.status(200).json({status:httpmessage.SUCCESS,blog});
    }else{
        const blog = await Blog.findByIdAndUpdate(id,{
            $push:{dislikes:userId},
        },{new:true});
        if(!blog) return next(appError.create('there is a problem',500));
        return res.status(200).json({status:httpmessage.SUCCESS,blog});
    }
});

module.exports={
    AddBlog,
    GetABlog,
    GetallBlogs,
    deleteBlog,
    UpdateBlog,
    likeAblog,
    dislikeAblog
}


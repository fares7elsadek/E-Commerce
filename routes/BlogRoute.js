const express = require('express');
const router =  express.Router();
const verifytoken = require('../middlewares/verifytoken');
const allowTo = require('../middlewares/allowTo');
const userRoles = require('../utils/userRoles');
const controllers = require('../controllers/BlogCTRL');
const validation = require('../middlewares/validationShema');


//Create new Blog
router.post('/',verifytoken,allowTo(userRoles.ADMIN),validation.BlogValidation(),controllers.AddBlog);


//get A Blog
router.get('/:blogId',controllers.GetABlog);


//get All Blogs
router.get('/',controllers.GetallBlogs);


//delete A Blog
router.delete('/:blogId',verifytoken,allowTo(userRoles.ADMIN),controllers.deleteBlog);


//like the blog
router.put('/like',verifytoken,controllers.likeAblog);


//dislikes
router.put('/dislike',verifytoken,controllers.dislikeAblog);


//update a blog
router.put('/:blogId',verifytoken,allowTo(userRoles.ADMIN),controllers.UpdateBlog);


module.exports=router;

const express = require('express');
const router =  express.Router();
const verifytoken = require('../middlewares/verifytoken');
const allowTo = require('../middlewares/allowTo');
const userRoles = require('../utils/userRoles');
const controllers = require('../controllers/ProductCTR');
const upload = require('../middlewares/UploadImages')
const validation = require('../middlewares/validationShema');


//Create Porduct
router.post('/',verifytoken,allowTo(userRoles.ADMIN),validation.ProductValidation(),controllers.Addproduct);

//upload product
router.put('/upload/:prodId',verifytoken,allowTo(userRoles.ADMIN)
,upload.uploadPhoto.array("images",10),controllers.UploadImage);



//get A Product
router.get('/:productId',controllers.Getproduct);


//get All Products
router.get('/',controllers.GetallProucts);


//delete A Product
router.delete('/:productId',verifytoken,allowTo(userRoles.ADMIN),controllers.deleteProduct);

//add to wishlist 
router.put('/wishlist',verifytoken,controllers.AddToWishlist);

//Rating
router.put('/rating',verifytoken,controllers.AddRating);

//update a product
router.put('/:productId',verifytoken,allowTo(userRoles.ADMIN),controllers.UpdateProduct);




module.exports=router;

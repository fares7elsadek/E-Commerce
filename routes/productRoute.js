const express = require('express');
const router =  express.Router();
const verifytoken = require('../middlewares/verifytoken');
const allowTo = require('../middlewares/allowTo');
const userRoles = require('../utils/userRoles');
const controllers = require('../controllers/ProductCTR');
const validation = require('../middlewares/validationShema');


//Create Porduct
router.post('/',verifytoken,allowTo(userRoles.ADMIN),validation.ProductValidation(),controllers.Addproduct);


//get A Product
router.get('/:productId',controllers.Getproduct);


//get All Products
router.get('/',controllers.GetallProucts);


//delete A Product
router.delete('/:productId',verifytoken,allowTo(userRoles.ADMIN),controllers.deleteProduct);


//update a product
router.put('/:productId',verifytoken,allowTo(userRoles.ADMIN),controllers.UpdateProduct);


module.exports=router;

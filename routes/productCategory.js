const express = require('express');
const router =  express.Router();
const verifytoken = require('../middlewares/verifytoken');
const allowTo = require('../middlewares/allowTo');
const userRoles = require('../utils/userRoles');
const controllers = require('../controllers/productCategory');
const validation = require('../middlewares/validationShema');





//create new Category
router.post('/',validation.PCategoryValidation(),verifytoken,allowTo(userRoles.ADMIN),controllers.CreateCategory);

//get all Categories
router.get('/',controllers.getAllCategories);



//get single category
router.get('/:categoryId',controllers.getSingleCategory);



//delete a user
router.delete('/:categoryId',verifytoken,allowTo(userRoles.ADMIN),controllers.deleteCategory);


//update a user
router.put('/:categoryId',verifytoken,allowTo(userRoles.ADMIN),controllers.UpdateCategory);


module.exports= router;
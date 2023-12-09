const express = require('express');
const router =  express.Router();
const verifytoken = require('../middlewares/verifytoken');
const allowTo = require('../middlewares/allowTo');
const userRoles = require('../utils/userRoles');
const controllers = require('../controllers/Brand');
const validation = require('../middlewares/validationShema');


//create new Brand
router.post('/',validation.PCategoryValidation(),verifytoken,allowTo(userRoles.ADMIN),controllers.CreateBrand);

//get all Brand
router.get('/',controllers.getAllBrands);

//get single Brand
router.get('/:brandId',controllers.getSingleBrand);

//delete a Brand
router.delete('/:brandId',verifytoken,allowTo(userRoles.ADMIN),controllers.deleteBrand);


//update a Brand
router.put('/:brandId',verifytoken,allowTo(userRoles.ADMIN),controllers.UpdateBrand);


module.exports= router;
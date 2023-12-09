const express = require('express');
const router =  express.Router();
const verifytoken = require('../middlewares/verifytoken');
const allowTo = require('../middlewares/allowTo');
const userRoles = require('../utils/userRoles');
const controllers = require('../controllers/coupon');
const validation = require('../middlewares/validationShema');


//create new Coupon
router.post('/',validation.CouponValidation(),verifytoken,allowTo(userRoles.ADMIN),controllers.CreateCoupon);

//get all Coupones
router.get('/',verifytoken,allowTo(userRoles.ADMIN),controllers.getAllCoupones);

//get single coupon
router.get('/:couponId',verifytoken,allowTo(userRoles.ADMIN),controllers.getSingleCoupon);

//delete a coupon
router.delete('/:couponId',verifytoken,allowTo(userRoles.ADMIN),controllers.deleteCoupon);


//update a coupon
router.put('/:couponId',verifytoken,allowTo(userRoles.ADMIN),controllers.UpdateCoupon);


module.exports= router;
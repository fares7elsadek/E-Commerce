const express = require('express');
const router =  express.Router();
const verifytoken = require('../middlewares/verifytoken');
const allowTo = require('../middlewares/allowTo');
const userRoles = require('../utils/userRoles');
const controllers = require('../controllers/users');




//get all users
router.get('/all-users',verifytoken,allowTo(userRoles.ADMIN),controllers.getAllUsers);

//get usre Cart
router.get('/cart',verifytoken,controllers.getCart);

//get orders
router.get('/get-orders',verifytoken,controllers.getOrders);


//get wishlist
router.get('/wishlist',verifytoken,controllers.GetWishlist);

//get single users
router.get('/:userId',verifytoken,allowTo(userRoles.ADMIN),controllers.getSingleUser);


//delete the cart 
router.delete('/empty-cart',verifytoken,controllers.EmptyCart);

//delete a user
router.delete('/:userId',verifytoken,allowTo(userRoles.ADMIN),controllers.deleteUser);

//update order status
router.put('/order/update-order/:id',verifytoken,controllers.updateOrderStatus);

//Save address
router.put('/save-address',verifytoken,controllers.SaveAddress);

//update a user
router.put('/:userId',verifytoken,allowTo(userRoles.ADMIN),controllers.UpdateUser);

//applay coupon
router.post('/cart/applaycoupon',verifytoken,controllers.applayCoupon);

//Add user cart
router.post('/cart',verifytoken,controllers.UserCart);

//Create Order
router.post('/cart/cash-order',verifytoken,controllers.CreateOrder);


module.exports= router;
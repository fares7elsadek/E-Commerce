const express = require('express');
const router =  express.Router();
const controllers = require('../controllers/auth.users');
const verifyToken = require('../middlewares/verifytoken');
const allowTo = require('../middlewares/allowTo');
const userRoles = require('../utils/userRoles');
const validation = require('../middlewares/validationShema');


//register user
router.post('/register',validation.UsersRigister(),controllers.registerUser);


//login user
router.post('/login',validation.UsersLogin(),controllers.loginUser);

//block user
router.put('/block-user/:userId',verifyToken,allowTo(userRoles.ADMIN),controllers.blockUser);


//unblock user
router.put('/unblock-user/:userId',verifyToken,allowTo(userRoles.ADMIN),controllers.unblockUser);


//refresh token
router.get('/refresh',controllers.handelRefreshToken);


//logout
router.get('/logout',controllers.logout);


//update password
router.put('/password',verifyToken,controllers.UpdatePassword);


//forget password token
router.post("/forgot-password-token", controllers.forgotPasswordToken);


//reset password
router.put("/reset-password/:token", controllers.resetPassword);

module.exports=router;
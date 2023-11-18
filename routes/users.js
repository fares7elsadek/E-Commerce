const express = require('express');
const router =  express.Router();
const verifytoken = require('../middlewares/verifytoken');
const allowTo = require('../middlewares/allowTo');
const userRoles = require('../utils/userRoles');
const controllers = require('../controllers/users');




//get all users
router.get('/all-users',controllers.getAllUsers);



//get single users
router.get('/:userId',controllers.getSingleUser);



//delete a user
router.delete('/:userId',controllers.deleteUser);


//update a user
router.put('/:userId',verifytoken,allowTo(userRoles.ADMIN),controllers.UpdateUser);


module.exports= router;
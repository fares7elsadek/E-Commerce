const { body,validationResult} = require('express-validator');


//register validation
const UsersRigister = ()=>{
    return [
        body('firstname').notEmpty(),
        body('lastname').notEmpty(),
        body('email').notEmpty(),
        body('password').notEmpty()
    ];
};

//login validation
const UsersLogin = ()=>{
    return [
        body('email').notEmpty(),
        body('password').notEmpty()
    ];
};

module.exports={
    UsersRigister,
    UsersLogin
}
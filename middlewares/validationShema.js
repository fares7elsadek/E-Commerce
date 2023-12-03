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

//product validation
const ProductValidation = ()=>{
    return [
        body('title').notEmpty(),
        body('description').notEmpty(),
        body('price').notEmpty(),
        body('category').notEmpty(),
        body('brand').notEmpty(),
        body('quantity').notEmpty()
    ];
};

module.exports={
    UsersRigister,
    UsersLogin,
    ProductValidation
}
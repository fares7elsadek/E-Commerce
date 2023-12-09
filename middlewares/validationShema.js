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


//blog validation
const BlogValidation =()=>{
    return [
        body('title').notEmpty(),
        body('description').notEmpty(),
        body('category').notEmpty()
    ];
}


//product category validation
const PCategoryValidation =()=>{
    return [
        body('title').notEmpty()
    ];
}

module.exports={
    UsersRigister,
    UsersLogin,
    ProductValidation,
    BlogValidation,
    PCategoryValidation
}
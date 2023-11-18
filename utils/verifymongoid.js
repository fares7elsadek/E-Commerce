const mongoose = require('mongoose');

const verifyid= (id)=>{
    const valid = mongoose.Types.ObjectId.isValid(id);
    if(!valid){
        const error = appError.create("invalid user id",400);
        return next(error);
    }
}

module.exports=verifyid;
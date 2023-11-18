const { startSession } = require('mongoose');
const appError = require('../utils/appError');

module.exports = (asyncFun)=>{
    return (req,res,next)=>{
        asyncFun(req,res,next).catch(err =>{
            const message = err.message;
            const statusCode =500;
            const error =appError.create(message,statusCode);
            next(error);
        })
    }
}
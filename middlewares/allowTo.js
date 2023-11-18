const appError = require("../utils/appError")

const allowTo = (...roles)=>{
    return (req,res,next)=>{
          if(!roles.includes(req.user.role)){
             const error = appError.create(`allowed only for ${roles}`,401);
             return next(error);
          }
          next();
    }
}

module.exports = allowTo;

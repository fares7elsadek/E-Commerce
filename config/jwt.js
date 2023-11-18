const jwt = require('jsonwebtoken');

const generateToken = (id,name,role)=>{
    return jwt.sign({id,name,role},process.env.JWT_SECRET,{expiresIn:'3d'});
}

module.exports={
    generateToken
}
const mongoose = require('mongoose'); 
const crypto = require('crypto');


var userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    lastname:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        default:"user"
    },
    isBloked:{
        type:Boolean,
        default:false
    },
    cart:{
        type:Array,
        default:[]
    },
    address:{
        type:String
    },
    wishlist:[{type:mongoose.Schema.ObjectId,ref:"Product"}],
    token:{
        type:String
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  {
    timeseries:true
  }
);

userSchema.methods.CreatePasswordResetToken = function(){
     const Token = crypto.randomBytes(32).toString("hex");
     const tokenHash = crypto.createHash("sha256").update(Token).digest("hex");
     this.passwordResetToken=tokenHash;
     this.passwordResetExpires= Date.now() + 10 * 60 *1000;
     return Token;
}

module.exports = mongoose.model('User', userSchema);

const User = require('../models/user');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Coupon =require('../models/coupon');
const Product = require('../models/ProductModel');
const asyncWrapper = require('../middlewares/asyncWrapper');
const httpmessage = require('../utils/htttpmessage');
const verifyid = require('../utils/verifymongoid');
const appError = require('../utils/appError');
const uniqid = require('uniqid');




//get all users
const getAllUsers  = asyncWrapper(async(req,res,next)=>{
    const query = req.query;
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page-1)*limit;
    const users=await User.find({},{'__v':false,'password':false}).limit(limit).skip(skip);
    res.json({status:httpmessage.SUCCESS,data:{users}});
});



//get a single user
const getSingleUser  = asyncWrapper(async(req,res,next)=>{
    const id = req.params.userId;
    verifyid(id);
    const user = await User.findById(id,{'password':false,'__v':false});
    if(!user){
        const error = appError.create("invalid user id",400);
        return next(error);
    }
    res.status(200).json({status:httpmessage.SUCCESS,data:{user}});
});


//delete a user
const deleteUser  = asyncWrapper(async(req,res,next)=>{
    const id = req.params.userId;
    verifyid(id);
    const done = await User.findByIdAndDelete(id);
    if(!done){
        const error = appError.create("invalid user id",400);
        return next(error);
    }
    res.status(200).json({
        ststus:httpmessage.SUCCESS,
        data:null
    });
});


//update a user
const UpdateUser  = asyncWrapper(async(req,res,next)=>{
    const id = req.params.userId;
    verifyid(id);
    const user = await User.findByIdAndUpdate(id,{$set:{...req.body}});
    if(!user){
        const error = appError.create("invalid user id",400);
        return next(error);
    }
    res.status(200).json({status:httpmessage.SUCCESS});
});

//get wishlist
const GetWishlist = asyncWrapper(async(req,res,next)=>{
    const userId = req.user.id;
    const user = await User.findById(userId,{'password':false,'__v':false}).populate('wishlist');
    if(!user) return next(appError.create("invalid user data",400));
    res.status(200).json(user);
})


//save user address
const SaveAddress = asyncWrapper(async(req,res,next)=>{
    const userId = req.user.id;
    const user = await User.findByIdAndUpdate(userId,{
        address:req.body.address
    },{new:true,projection:{'password':0,'__v':0}});
    if(!user) return next(appError.create("invalid user data",400));
    res.status(200).json(user);
});


//Add user cart
const UserCart = asyncWrapper(async(req,res,next)=>{
    const cart = req.body;
    // console.log(data)
    const userId = req.user.id;
    let products =[];
    const user = await User.findById(userId);
    if(!user) return next(appError.create("invalid user data",400));
    const AlreadyExistCart = await Cart.findOne({orderby:userId});
    if(AlreadyExistCart){
        await Cart.findOneAndDelete({orderby:userId});
    }
    for(let i=0;i<cart.length;i++){
        let object = {};
        object.product = cart[i].id;
        object.count = cart[i].count;
        object.color = cart[i].color;
        let getprice = await Product.findById(cart[i].id).select("price").exec();
        object.price=getprice.price;
        products.push(object);
    }
    let TotalPrice=0;
    for(let i=0;i<products.length;i++){
        TotalPrice+=products[i].price;
    }
    const newcart = await new Cart({
        products,
        cartTotal:TotalPrice,
        orderby:userId
    }).save();
    if(!newcart)return next(appError.create("invalid user data",400));
    res.status(200).json(newcart);
    
});


//get user cart
const getCart = asyncWrapper(async(req,res,next)=>{
    const userId = req.user.id;
    verifyid(userId);
    const user = await Cart.findOne({orderby:userId}).populate("products.product");
    if(!user)return next(appError.create("invalid request",400));
    res.status(200).json(user);
})

//empty the cart
const EmptyCart = asyncWrapper(async(req,res,next)=>{
    const userId = req.user.id;
    verifyid(userId);
    const user = await Cart.findOneAndDelete({orderby:userId});
    if(!user)return next(appError.create("invalid request",400));
    res.status(200).json(user);
})

//applay coupon
const applayCoupon = asyncWrapper(async(req,res,next)=>{
    const coupon = req.body.coupon;
    const userId = req.user.id;
    const validCoupon = await Coupon.findOne({name:coupon});
    if(!validCoupon)return next(appError.create("invalid coupon",400));
    const discount = validCoupon.discount;
    const cart = await Cart.findOne({orderby:userId});
    console.log(cart)
    if(!cart)return next(appError.create("there's not cart for that user",400));
    let totalPrice = cart.cartTotal;
    let priceAfterDiscount = totalPrice - (discount/100)*totalPrice;
    const done = await Cart.findOneAndUpdate({orderby:userId},{
        totalAfterDiscount:priceAfterDiscount
    },{new:true}).populate("products.product");
    if(!done)return next(appError.create("there's an error",400));
    res.status(200).json(done.totalAfterDiscount);
})

//create oreder
const CreateOrder = asyncWrapper(async(req,res,next)=>{
    const { COD, couponApplied } = req.body;
    const { id } = req.user;
    verifyid(id);
    try {
      if (!COD)return next(appError.create("there's an error",400));
      const user = await User.findById(id);
      let userCart = await Cart.findOne({ orderby: user.id });
      let finalAmout = 0;
      if (couponApplied && userCart.totalAfterDiscount) {
        finalAmout = userCart.totalAfterDiscount;
      } else {
        finalAmout = userCart.cartTotal;
      }
  
      let newOrder = await new Order({
        products: userCart.products,
        paymentIntent: {
          id: uniqid(),
          method: "COD",
          amount: finalAmout,
          status: "Cash on Delivery",
          created: Date.now(),
          currency: "usd",
        },
        orderby: user.id,
        orderStatus: "Cash on Delivery",
      }).save();
      let update = userCart.products.map((item) => {
        return {
          updateOne: {
            filter: { _id: item.product._id },
            update: { $inc: { quantity: -item.count, sold: +item.count } },
          },
        };
      });
      const updated = await Product.bulkWrite(update, {});
      res.json({ message: "success" });
    } catch (error) {
      throw new Error(error);
    }
})

const getOrders = asyncWrapper(async(req,res,next)=>{
    const { id } = req.user;
  verifyid(id);
  try {
    const userorders = await Order.findOne({ orderby: id })
    .populate({
        path: 'orderby',
        select: 'firstname lastname email mobile role'
    })
    .populate("products.product")
    .exec();
    res.json(userorders);
  } catch (error) {
    throw new Error(error);
  }
})

const updateOrderStatus = asyncWrapper(async (req, res,next) => {
    const { status } = req.body;
    const { id } = req.params;
    verifyid(id);
    try {
      const updateOrderStatus = await Order.findByIdAndUpdate(
        id,
        {
          orderStatus: status,
          paymentIntent: {
            status: status,
          },
        },
        { new: true }
      );
      res.json(updateOrderStatus);
    } catch (error) {
      throw new Error(error);
    }
 });

module.exports = {
    getAllUsers,
    getSingleUser,
    deleteUser,
    UpdateUser,
    GetWishlist,
    SaveAddress,
    UserCart,
    getCart,
    EmptyCart,
    applayCoupon,
    CreateOrder,
    getOrders,
    updateOrderStatus
}




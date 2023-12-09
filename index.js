const express = require('express');
require('dotenv').config();
const app = express();
const dbConnect = require('./config/dbConnect');
const httpmessage = require('./utils/htttpmessage');
const cookieParser = require('cookie-parser');
const authusers = require('./routes/auth.users');
const usersRoute = require('./routes/users');
const morgan = require('morgan');
const BlogRoute = require('./routes/BlogRoute');
const ProductRoute = require('./routes/productRoute');
const PCategory = require('./routes/productCategory');
const bCategory = require('./routes/blogCategory');
const BrandRoute = require('./routes/Brand');
const CouponRoute = require('./routes/coupon');
const port  = process.env.PORT || 5000 ;



dbConnect();
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

//users authentication
app.use('/api/user',authusers);
//users route
app.use('/api/user',usersRoute);
//product route
app.use('/api/product',ProductRoute);
//blog route
app.use('/api/blog',BlogRoute);
//product category route
app.use('/api/category',PCategory);
//blog category route
app.use('/api/blogcategory',bCategory);
//brand route
app.use('/api/brand',BrandRoute);
//coupon route
app.use('/api/coupon',CouponRoute);

app.all('*',(req,res)=>{
    res.status(404).json({status:httpmessage.FAIL,message:"NOT FOUND"});
})

app.use((error,req,res,next)=>{
    res.json({status:error.statusCode,message:error.message});
})

app.listen(port,()=>{
    console.log(`the server is running on port ${port}`);
});


const express = require('express');
require('dotenv').config();
const app = express();
const dbConnect = require('./config/dbConnect');
const httpmessage = require('./utils/htttpmessage');
const authusers = require('./routes/auth.users');
const usersRoute = require('./routes/users');
const port  = process.env.PORT || 5000 ;



dbConnect();
app.use(express.json());

//users authentication
app.use('/api/user',authusers);
//users route
app.use('/api/user',usersRoute);

app.all('*',(req,res)=>{
    res.status(404).json({status:httpmessage.FAIL,message:"NOT FOUND"});
})

app.use((error,req,res,next)=>{
    res.json({status:error.statusCode,message:error.message});
})

app.listen(port,()=>{
    console.log(`the server is running on port ${port}`);
});


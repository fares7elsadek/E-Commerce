const { default: mongoose } = require("mongoose")

module.exports = ()=>{
    mongoose.connect(process.env.MONGO_URL).then((res)=>{
        console.log('database is connected');
    }).catch(err => console.log(err));
}
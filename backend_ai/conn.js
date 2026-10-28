const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume_checker';

mongoose.connect(mongoURI).then((res)=>{
    console.log("Database Connected Successfully to", mongoURI);
}).catch(err=>{
    console.log("Database Connection Error:", err.message);
});

const mongoose = require('mongoose');

const connectDB = async ()=> {

    try {
await mongoose.connect(process.env.MONGO_URI);
console.log('mongodb connected');
    }catch (error){
        console.log('DB connection:error',err.message);
        process.exit[1];

    }
};

module.exports = connectDB;
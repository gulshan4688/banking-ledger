import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
async function connectDB() {
    await mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("DB connected");
    })
    .catch(err =>{
        console.log(err.message);
        process.exit(1);
    })
}

export default connectDB;
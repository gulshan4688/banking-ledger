import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "name is required for creating an account"],

    },
    email : {
        type : String,
        required :[ true, "emial is required for creating user"],
        trim : true,
        lowercase : true,
        match: [ /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please use a valid email address"],
        unique : true

    },
    password : {
        type : String,
        required : [true, "password is required."],
        minLength : [8, "Your password should contain atleast 8 characters."],
        select : false
        // by writing this select : false whenever we demand for the user data password will not come in that response we have to expilicitly write it as
        // const user = userModel.findOne({ email }).select("+password")

    },
    systemUser : {
        type : Boolean,
        default : false, 
        immutable : false, 
        select : false
    }

},{
    timestamps : true
})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function(password){
    return bcrypt.compare(password, this.password);
}

const userModel = mongoose.model("User", userSchema);

export default userModel;

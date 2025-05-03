import mongoose from "mongoose";
import bcrypt from "bcryptjs"
const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true,"Username is required!"],
        unique:true,
        trim:true
    },
    email:{
        type:String,
        required:[true,"Email is required!"],
        unique:true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:[true,"Password is required!"],
        minlength:6
    },
    profilePic: {
        type: String, 
        default: "",  
      },
    followers:[{
        type : mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    following:[{
        type : mongoose.Schema.Types.ObjectId,
        ref:"User"
    }]
},{timestamps:true})

UserSchema.pre('save',async function (next) {
    if(!this.isModified('password'))next()

    const salt = await bcrypt.genSalt(10)
    this.password= await bcrypt.hash(this.password,salt)
    next()
})

UserSchema.methods.matchPassword = async function (enteredpassword) {
    console.log("EnteredPassword",enteredpassword)
    console.log("Db Hashed Password",this.password)
    const ismatch = await bcrypt.compare(enteredpassword,this.password)
    console.log("Password match result:",ismatch)
    return ismatch
}

const User = mongoose.model("User",UserSchema)
export default User

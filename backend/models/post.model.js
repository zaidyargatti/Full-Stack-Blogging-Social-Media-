import mongoose, { model, mongo } from "mongoose"

const postSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Title is required!"]
    },
    content:{
        type:String,
        required:true
    },
    image:{
        type:String,
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }],
    comment:
    [
    {
    user:
    { 
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
    },
    text:
    {
        type:String,
        required:true
    }
    }
  ],
    createdAt:{
        type:Date,
        default:Date.now
    }
},{timestamps:true})

const Post = mongoose.model("Post",postSchema)
export default Post
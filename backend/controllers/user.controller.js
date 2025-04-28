import User from "../models/user.model.js"
import jwt from "jsonwebtoken"
import Post from "../models/post.model.js"
import Notification from "../models/notification.model.js"

const generateToken =(id)=>{
 return jwt.sign({id},process.env.JWT_SECRET,{
    expiresIn:'30d'
 })
}

// User is going to register 
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const userExist = await User.findOne({ email });
      if (userExist) {
        res.status(400).json({
          message: "User already exist!",
        });
      }
  
      const user = await User.create({
        username,
        email,
        password,
      });
  
      if (user) {
        //  THIS IS MISSING IN YOUR CODE 
        req.session.user = {
          _id: user._id,
          email: user.email,
          username: user.username,
        };
  
      return  res.status(200).json({
          user: {
            _id: user._id,
            email: user.email,
            username: user.username,
          },
          token: generateToken(user._id),
        });
      }
     
    } catch (error) {
        console.error("Error in registerUser:", error);
      res.status(500).json({
        message: error.message,
      });
    }
  };
  

const loginUser = async (req,res)=>{
   const {email,password} =req.body

   try {
    const user = await User.findOne({email})
    console.log("User found",user)
    if(!user){
       res.status(401).json({
        message:"User is invalid"
       })
    }
    const ispasswordValid = await user.matchPassword(password)
    console.log("ispasswordValid:",ispasswordValid)
    if (ispasswordValid) {
        //  THIS IS MISSING IN YOUR CODE 
        req.session.user = {
          _id: user._id,
          email: user.email,
          username: user.username,
        };
  
        res.status(200).json({
          message: "Login successfully",
          user: {
            _id: user._id,
            email: user.email,
            username: user.username,
          },
          token: generateToken(user._id),
        });
      } else{
    res.status(401)
    .json({
        message:"Invalid email or password!"
    })
    }
   } catch (error) {
    res.status(500)
    .json({
        message:error.message
    })
   }
}


const getUserprofile = async(req,res)=>{
   try {
    const {id}= req.params
    const user = await User.findById(id).select("-password")
    if(!user)
    {
        return res.status(404)
        .json({
            message:"User Not Found!"
        })
    }
    const posts = await Post.find({author:id}).populate("likes comment")
    return res.status(200)
    .json({
        message:"User Profile Retrived Successfully",
        user,
        posts
    })
   } catch (error) {
    
   }
}


const updateUser = async(req,res)=>{
    const user = req.user
    if(user){
        req.username= req.body.username || req.username
        req.email= req.body.email || req.email

        if(req.body.password){
            req.password=req.body.password
        }
        const updatedUser = await user.save()
        res.status(200)
        .json({
            _id:updatedUser._id,
            username:updatedUser.username,
            email:updatedUser.email,
            token:generateToken(updatedUser._id)
        })
    }
    else{
        res.status(404)
        .json({
            message:"User not found!"
        })
    }
}


const UserToFollow = async(req,res)=>{
    try {
        const {id} = req.params
        const currentUser= req.user._id
        if(id === currentUser){
            return res.status(400)
            .json({
                message:"You cannot follow to yourself"
            })
        }
    
        const Usertofollow = await User.findById(id)
        const Loggedinuser = await User.findById(currentUser)
        if(!Usertofollow || !Loggedinuser){
            return res.status(404)
            .json({
                message:"User Not Found!"
            })
        }
        if(!Loggedinuser.following.includes(id)){
         const AddingUserToFollowing = await User.updateOne(
            {
            _id:currentUser
           },
           {
            $push:{
                following:id
            }
           }
        )
      const AddingUserInFollowerOfOtherUser =  await User.updateOne(
            {
                _id:id
            },
            {
                $push:{
                    followers:currentUser
                }
            }
        )
        return await Notification.create({
            user:Usertofollow._id,
            sender:Loggedinuser._id,
            type:"follow"
        })
    
            return res.status(200)
            .json({
                message:"User followed successfully"
            })
        }else{
            return res.status(400)
            .json({
                message:"You are already following this user"
            })
        }
    } catch (error) {
         res.status(500)
         .json({
            message:error.message
         })
    }
}


const UnfolloweUser = async(req,res)=>{
    try {
        const {id}= req.params
        const currentUser = req.user._id
        
        if(id === currentUser){
            return res.status(400)
            .json({
                message:"You cannot unfollow yourself!"
            })
        }
       
        const UserToUnfollow = await User.findById(id)
        const Loggedinuser = await User.findById(currentUser)
        if(!UserToUnfollow || !Loggedinuser){
            return res.status(404)
            .json({
                message:"User Not Found!"
            })
        }

        if(Loggedinuser.following.includes(id)){
        const RemoveOtherUserFromOurFollowing = await  User.updateOne(
            {
                _id:currentUser
            },
        {
            $pull:{
                following:id
            }
        })

      const RemovingMeFromOtherUserFollowers = await  User.updateOne(
            {
                _id:id
            },
            {
                $pull:{
                    followers:currentUser
                }
            }
        )
        return res.status(200)
        .json({
            message:"Unfollowed Successfully"
        })
        }else{
       return res.status(400)
       .json({
        message:"You are not following this user"
       })
        }

    } catch (error) {
        res.status(500)
        .json({
            message:error.message
        })
    }
}


const checkAuth = (req, res) => {
    if (req.user) {
      res.status(200).json({ user: req.user });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
};



  

export {
    registerUser,
    loginUser,
    getUserprofile,
    updateUser,
    UserToFollow,
    UnfolloweUser,
    checkAuth
}
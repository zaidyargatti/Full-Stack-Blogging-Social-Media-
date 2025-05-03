import User from "../models/user.model.js"
import jwt from "jsonwebtoken"
import Post from "../models/post.model.js"
import Notification from "../models/notification.model.js"
import cloudinary from "../config/cloudinary.js"

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
    const posts = await Post.find({author:id}).populate("author", "username").populate("likes comment")
    return res.status(200)
    .json({
        message:"User Profile Retrived Successfully",
        user,
        posts,
        postCount: posts.length
    })
   } catch (error) {
    
   }
}

const updateUser = async (req, res) => {
    try {
      const user = req.user;
  
      if (!user) {
        return res.status(404).json({ message: 'User not found!' });
      }
  
      // Basic updates
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
  
      if (req.body.password) {
        user.password = req.body.password;
      }
  
      // Image upload
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'profile_pictures',
          width: 500,
          height: 500,
          crop: 'limit',
        });
  
        if (result && result.secure_url) {
          user.profilePic = result.secure_url;
          console.log("Uploaded profile picture URL:", result.secure_url); // ✅ moved inside
        } else {
          return res.status(500).json({ message: 'Cloudinary upload failed' });
        }
      }
  
      const updatedUser = await user.save();
  
      res.status(200).json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
      });
    } catch (error) {
      console.error("Update failed:", error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  const UserToFollow = async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.user._id;
  
      if (id === currentUser.toString()) {
        return res.status(400).json({ message: "You cannot follow yourself" });
      }
  
      const Usertofollow = await User.findById(id);
      const Loggedinuser = await User.findById(currentUser);
  
      if (!Usertofollow || !Loggedinuser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (!Loggedinuser.following.includes(id)) {
        await User.updateOne({ _id: currentUser }, { $push: { following: id } });
        await User.updateOne({ _id: id }, { $push: { followers: currentUser } });
  
        await Notification.create({
          user: Usertofollow._id,
          sender: Loggedinuser._id,
          type: "follow",
        });
  
        const io = req.app.get("io");
        const onlineUsers = req.app.get("onlineUsers");
        const receiverSocket = onlineUsers.get(Usertofollow._id.toString());
  
        if (receiverSocket) {
          // 🔔 Notification emit
          io.to(receiverSocket).emit("newNotification", {
            type: "follow",
            sender: req.user.username,
            senderId: req.user._id,
          });
  
          // 🔄 Follow status update emit
          io.to(receiverSocket).emit("followStatusChanged", {
            followerId: req.user._id,
            isFollowing: true,
          });
        }
  
        return res.status(200).json({ message: "User followed successfully" });
      } else {
        return res.status(400).json({ message: "You already follow this user" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  
  const UnfolloweUser = async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.user._id;
  
      if (id === currentUser.toString()) {
        return res.status(400).json({ message: "You cannot unfollow yourself!" });
      }
  
      const UserToUnfollow = await User.findById(id);
      const Loggedinuser = await User.findById(currentUser);
  
      if (!UserToUnfollow || !Loggedinuser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (Loggedinuser.following.includes(id)) {
        await User.updateOne({ _id: currentUser }, { $pull: { following: id } });
        await User.updateOne({ _id: id }, { $pull: { followers: currentUser } });
  
        const io = req.app.get("io");
        const onlineUsers = req.app.get("onlineUsers");
        const receiverSocket = onlineUsers.get(id.toString());
  
        if (receiverSocket) {
          io.to(receiverSocket).emit("followStatusChanged", {
            followerId: req.user._id,
            isFollowing: false,
          });
        }
  
        return res.status(200).json({ message: "Unfollowed successfully" });
      } else {
        return res.status(400).json({ message: "You are not following this user" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

const checkAuth = (req, res) => {
    if (req.user) {
      res.status(200).json({ user: req.user });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
};




const searchuser = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: "Please provide a search query." });
        }

        const searchQuery = {
            $or: [
                { username: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } }
            ]
        };

        const user = await User.find(searchQuery).lean();

        return res.status(200).json({
            message: "Search Results Retrieved Successfully",
            user
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


  

export {
    registerUser,
    loginUser,
    getUserprofile,
    updateUser,
    UserToFollow,
    UnfolloweUser,
    checkAuth,
    searchuser
}
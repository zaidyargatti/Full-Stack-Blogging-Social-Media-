import express from "express"
import { Router } from "express"
import { checkAuth, getUserprofile, loginUser, registerUser, searchuser, UnfolloweUser, updateUser, UserToFollow, } from "../controllers/user.controller.js"
import protect from "../middleware/auth.middleware.js"
import upload from "../middleware/multer.middleware.js"
const route = Router()

route.post("/register",registerUser)
route.post("/login",loginUser)
//frotend checking auth routes
route.get("/check",protect,checkAuth)
route.get("/search",protect,searchuser)

route.get("/:id",protect,getUserprofile)
route.put("/profile", protect, upload.single('profilePic'), updateUser);

route.post("/:id/follow",protect,UserToFollow)
route.post("/:id/unfollow",protect,UnfolloweUser)


export default route

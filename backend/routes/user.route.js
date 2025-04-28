import express from "express"
import { Router } from "express"
import { checkAuth, getUserprofile, loginUser, registerUser, UnfolloweUser, updateUser, UserToFollow } from "../controllers/user.controller.js"
import protect from "../middleware/auth.middleware.js"
const route = Router()

route.post("/register",registerUser)
route.post("/login",loginUser)

route.get("/:id",protect,getUserprofile)
route.put("/profile",protect,updateUser)

route.post("/:id/follow",protect,UserToFollow)
route.post("/:id/unfollow",protect,UnfolloweUser)

//frotend checking auth routes
route.get("/check",checkAuth)

export default route

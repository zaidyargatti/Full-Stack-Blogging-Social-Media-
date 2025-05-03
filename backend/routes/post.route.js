import { Router } from "express";
import protect from "../middleware/auth.middleware.js";
import { commentOnPost, createPost, deleteComment, deletePost, getAllPost,
 getPageInation, getPostById, getPostsHome, likePost,searchPost,
 unlikePost, updatePost,getUserPostsByUserId } from "../controllers/post.controller.js";

const path = Router()

//Search Route
path.get("/search",protect,searchPost)

path.get("/paginated",protect,getPageInation)
//Ceating a post
path.post("/create-Post",protect,createPost)
path.get("/all",protect,getAllPost)
path.get("/homeposts",protect,getPostsHome)
path.get("/:id",protect,getPostById)
path.get("/user/:id", protect, getUserPostsByUserId); 
path.put("/:id",protect,updatePost)
path.delete("/:id",protect,deletePost)

//Liking a post
path.put("/:id/like",protect,likePost)
path.put("/:id/unlike",protect,unlikePost)

//Adding a comment
path.post("/comment/:id",protect,commentOnPost)
path.delete("/comment/:id/:commentId", protect, deleteComment);

export default path
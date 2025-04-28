import { Router } from "express";
import protect from "../middleware/auth.middleware.js";
import { commentOnPost, createPost, deleteComment, deletePost, getAllPost,
 getPageInation, getPostById, likePost,searchPost,
 unlikePost, updatePost } from "../controllers/post.controller.js";

const path = Router()

//Search Route
path.get("/search",protect,searchPost)

path.get("/paginated",protect,getPageInation)
//Ceating a post
path.post("/create-Post",protect,createPost)
path.get("/all",getAllPost)
path.get("/:id",getPostById)
path.put("/:id",protect,updatePost)
path.delete("/:id",protect,deletePost)

//Liking a post
path.put("/:id/like",protect,likePost)
path.put("/:id/unlike",protect,unlikePost)

//Adding a comment
path.post("/comment/:id",protect,commentOnPost)
path.delete("/comment/:id/:commentId", protect, deleteComment);

export default path
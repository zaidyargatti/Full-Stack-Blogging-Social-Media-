import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
const createPost = async (req, res) => {
    try {
        const { title, content, image } = req.body
        if (!title || !content) {
               res.status(400)
                .json({
                    message: "Title or content is required!"
                })
        }
        const post = await Post.create({
            title,
            content,
            image,
            author: req.user._id
        })

       res.status(201)
            .json({
                message: "Created Successfully",
                post
            })

    } catch (error) {
        res.status(500)
            .json({
                message: error.message
            })
    }
}

const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user._id })
            .populate("author", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Successfully Fetched",
            posts,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const getPostsHome = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Successfully Fetched",
            posts,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("author", "username email")
        if (!post) {
            res.status(404)
                .json({
                    message: "Post not found"
                })
        }
        res.status(200)
            .json({
                message: "Post found",
                post
            })
    } catch (error) {
        res.status(500)
            .json({
                message: error.message
            })
    }
}

const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            res.status(404)
                .json({
                    message: "Post not found"
                })
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403)
                .json({
                    message: "Not authorized to update this post"
                })
        }
        post.title = req.body.title || req.title
        post.content = req.body.content || req.content
        post.image = req.body.image || req.image

        const updatedPost = await post.save()
        res.status(200)
            .json({
                message: "Post Updated Successfully",
                updatedPost
            })
    } catch (error) {
        res.status(500)
            .json({
                message: error.message
            })
    }
}

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            res.status(404)
                .json({
                    message: "Post not found"
                })
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403)
                .json({
                    message: "Not authorized to update this post"
                })
        }

        await post.deleteOne()
        res.status(200)
            .json({
                message: "Post Deleted Successfully"
            })
    } catch (error) {
        res.status(500)
            .json({
                message: error.message
            })
    }
}

const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author');

        console.log("Fetched Post:", post);

        if (!post) {
            return res.status(404).json({
                message: "Post Not Found!"
            });
        }

        if (post.likes.includes(req.user._id.toString())) {
            return res.status(400).json({
                message: "Post Already Liked."
            });
        }

        // Add Like
        post.likes.push(req.user._id);
        await post.save();

        console.log("Post Likes After Adding:", post.likes);

        // Check Post Author before creating notification
        if (post.author && req.user._id.toString() !== post.author._id.toString()) {
            const notification = await Notification.create({
                user: post.author._id,  // Post owner
                sender: req.user._id,   // Liker
                type: "like",
                post: post._id,
                isread: false
            });
            const io = req.app.get("io");
            const onlineUsers = req.app.get("onlineUsers");
            
            const receiverSocket = onlineUsers.get(post.author._id.toString());
            if (receiverSocket) {
              io.to(receiverSocket).emit("newNotification", {
                type: "like",
                sender: req.user.username,
                senderId: req.user._id,
                post: { _id: post._id, title: post.title },
              });
            }
            console.log(`Sending LIKE notification to socket ${receiverSocket}`);

            
            
        } else if (!post.author) {
            console.log("Post Author Not Found!");
            return res.status(400).json({
                message: "Post Author Not Found!"
            });
        } else {
            console.log("User liked their own post, no notification created.");
        }

        res.status(200).json({
            message: "Post Liked Successfully",
            likes: post.likes.length
        });

    } catch (error) {
        console.error("Error in likePost:", error);
        res.status(500).json({
            message: error.message
        });
    }
};





const unlikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post Not Found!" });
        }


        const userIdStr = req.user._id.toString();
        const likesArrayStr = post.likes.map(id => id.toString());

        //For debuggin purpose 
        //   console.log("User ID trying to unlike:", userIdStr);
        // console.log("Likes before unliking:", likesArrayStr);

        if (!likesArrayStr.includes(userIdStr)) {
            return res.status(400).json({ message: "Post Not Liked Yet!" });
        }


        post.likes = post.likes.filter(id => id.toString() !== userIdStr);
        await post.save();

        console.log("Likes after unliking:", post.likes.map(id => id.toString()));

        res.status(200).json({
            message: "Post Unliked Successfully",
            likes: post.likes.length
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const commentOnPost = async (req, res) => {
    try {
      const post = await Post.findById(req.params.id).populate('author');
  
      if (!post) {
        return res.status(404).json({ message: "Post Not Found!" });
      }
  
      const NewComment = {
        user: req.user._id,
        text: req.body.text,
        createdAt: new Date(),
      };
  
      post.comment.push(NewComment);
      await post.save();
  
      
      if (post.author._id.toString() !== req.user._id.toString()) {
        await Notification.create({
          user: post.author._id,
          sender: req.user._id,
          type: "comment",
          post: post._id,
        });
  
   
        const io = req.app.get("io");
        const onlineUsers = req.app.get("onlineUsers");
        const receiverSocket = onlineUsers.get(post.author._id.toString());
  
        if (receiverSocket) {
          io.to(receiverSocket).emit("newNotification", {
            type: "comment",
            sender: req.user.username,
            post: { _id: post._id, title: post.title },
          });
        }
      }
  
      res.status(200).json({
        message: "Comment Added Successfully",
        comment: post.comment,
      });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

const deleteComment = async (req, res) => {
    try {

        const { id, commentId } = req.params


        const post = await Post.findById(id)
        console.log("Recived Post ID", id)
        if (!post) {
            return res.status(404)
                .json({
                    message: "Post Not Found!"
                })
        }

        const comment = post.comment.find(c => c._id.toString() === commentId)
        if (!comment) {
            return res.status(404)
                .json({
                    message: "Comment Not Found!"
                })
        }

        if (comment.user.toString() !== req.user._id.toString() &&
            post.author.toString() !== req.user._id.toString()) {

            return res.status(403)
                .json({
                    message: "Not Authorizes To Delete This Comment!"
                })
        }

        post.comment = post.comment.filter(c => c._id.toString() !== commentId)
        await post.save()

        return res.status(200)
            .json({
                message: "Comment Deleted Successfully",
                comment: post.comment
            })

    } catch (error) {
        res.status(500)
            .json({
                message: error.message
            })
    }
}

const searchPost = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: "Please provide a search query." });
        }

        const searchQuery = {
            $or: [
                { title: { $regex: query, $options: "i" } },
                { content: { $regex: query, $options: "i" } }
            ]
        };

        const posts = await Post.find(searchQuery).lean();

        return res.status(200).json({
            message: "Search Results Retrieved Successfully",
            count: posts.length,
            posts
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getPageInation = async(req,res)=>{
    try {
        const {page=1 ,limit=5}=req.query

        const totalPost= await Post.countDocuments({})
        const posts = await Post.find({})
              .sort({createdAt:-1})
              .skip((page -1 )*parseInt(limit))
              .limit(parseInt(limit))
              .lean()

        return res.status(200)
        .json({
            message:"Paginated Retrived Successfully",
            count:totalPost,
            currentPage:parseInt(page),
            totalPages:Math.ceil(totalPost/limit),
            posts
        })

    } catch (error) {
        res.status(500)
        .json({
            message:error.message
        })
    }
}

const getUserPostsByUserId = async (req, res) => {
    try {
      const { id } = req.params;
  
      const posts = await Post.find({ author: id }).populate("author", "username profilePic");
  
      res.status(200).json({
        message: "User posts fetched successfully",
        posts,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

export {
    createPost,
    getAllPost,
    getPostById,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    commentOnPost,
    deleteComment,
    searchPost,
    getPageInation,
    getPostsHome,
    getUserPostsByUserId
}
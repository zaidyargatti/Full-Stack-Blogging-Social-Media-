import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../utils/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

function PostDetail() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [openMenu, setOpenMenu] = useState(null); // store commentId for open menu

  const fetchPost = async () => {
    try {
      const res = await axios.get(`/api/post/${id}`);
      setPost(res.data.post);
      setLiked(res.data.post.likes.includes(user._id));
    } catch (error) {
      console.error('Failed to fetch post:', error);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchPost();
    }
  }, [id, user, loading]);

  const handleLike = async () => {
    try {
      if (liked) {
        await axios.put(`/api/post/${id}/unlike`);
        setPost(prev => ({
          ...prev,
          likes: prev.likes.filter(uid => uid !== user._id),
        }));
      } else {
        await axios.put(`/api/post/${id}/like`);
        setPost(prev => ({
          ...prev,
          likes: [...prev.likes, user._id],
        }));
      }
      setLiked(!liked);
    } catch (error) {
      console.error('Failed to like/unlike post:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/post/comment/${id}`, { text: commentText });
      setCommentText('');
      fetchPost();
    } catch (error) {
      console.error('Failed to comment on post:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`/api/post/comment/${id}/${commentId}`);
      setOpenMenu(null);
      fetchPost();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  if (loading) return <div className="text-center py-20">Loading post...</div>;
  if (!post) return <div className="text-center py-20 text-gray-500">Post not found.</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{post.title}</h1>
        <div className="text-gray-600 mb-8">
          By {post.author?.username || "Unknown Author"} •{" "}
          {new Date(post.createdAt).toLocaleDateString()}
        </div>

        <div className="text-gray-700 leading-relaxed mb-10">{post.content}</div>

        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handleLike}
            disabled={!user}
            className="text-3xl focus:outline-none transition-transform transform hover:scale-125"
          >
            {liked ? "❤️" : "🤍"}
          </button>
          <span className="text-gray-600 text-lg">{post.likes?.length || 0} likes</span>
        </div>

        <form onSubmit={handleCommentSubmit} className="mt-6">
          <textarea
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows="3"
            className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          ></textarea>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600"
          >
            Submit Comment
          </button>
        </form>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Comments:</h3>
          {post.comment?.length > 0 ? (
            post.comment.map((cmt, idx) => {
              const isAuthor = cmt.user === user._id || cmt.user?._id === user._id;
              const isPostOwner = post.author._id === user._id;
              const showMenu = openMenu === cmt._id;

              return (
                <div key={idx} className="bg-white p-4 rounded shadow mb-3 relative">
                  <p className="text-gray-700">{cmt.text}</p>

                  {(isAuthor || isPostOwner) && (
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === cmt._id ? null : cmt._id)
                        }
                        className="text-gray-400 hover:text-gray-600 text-xl"
                      >
                        ⋯
                      </button>

                      {showMenu && (
                        <div className="absolute right-0 mt-2 bg-white border shadow rounded w-32 z-10">
                          <button
                            onClick={() => handleDeleteComment(cmt._id)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setOpenMenu(null)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostDetail;

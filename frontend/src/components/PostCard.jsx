import { Link } from 'react-router-dom';

function PostCard({ post }) {
  return (
    <Link to={`/post/${post._id}`}>
      <div className="bg-white shadow-md rounded p-4 hover:shadow-lg transition flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{post.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.content}</p>
        </div>
        <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
          <span>By {post.author ? post.author.username : "Unknown Author"}</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            ❤️ {post.likes?.length || 0} Likes
            💬 {post.comment?.length || 0} Comments
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PostCard;

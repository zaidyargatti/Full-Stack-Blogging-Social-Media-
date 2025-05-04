import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/Axios';

function PostCard({ post, showActions = false, onPostDeleted, onPostUpdated }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const contentLimit = 120;

  const isLong = post.content.length > contentLimit;
  const snippet = isLong ? post.content.slice(0, contentLimit) + '...' : post.content;

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: post.title, content: post.content });
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReadMore = () => {
    if (!isEditing) navigate(`/post/${post._id}`);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleEditSave = async () => {
    try {
      const res = await axios.put(`/api/post/${post._id}`, editForm);
      setIsEditing(false);
      onPostUpdated?.(res.data.updatedPost);
    } catch (err) {
      console.error("Failed to update post", err);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/post/${post._id}`);
      onPostDeleted?.(post._id);
    } catch (err) {
      console.error("Failed to delete post", err);
    }
  };

  return (
    <div className="bg-gray-200 text-black shadow-md rounded p-4 hover:shadow-lg transition flex flex-col justify-between relative">
      {/* Action Buttons */}
      {showActions && user && user._id === post.author?._id && (
        <div className="absolute top-2 right-2 flex gap-2">
          <button onClick={handleEditToggle} className="text-blue-600 hover:text-blue-800">
            <FiEdit />
          </button>
          <button onClick={() => setShowConfirm(true)} className="text-red-600 hover:text-red-800">
            <FiTrash2 />
          </button>
        </div>
      )}

      {/* Edit Mode */}
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <input
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            className="border px-2 py-1 rounded"
          />
          <textarea
            value={editForm.content}
            onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
            className="border px-2 py-1 rounded"
          />
          <div className="flex gap-2 mt-2">
            <button onClick={handleEditSave} className="text-sm bg-blue-600 text-white px-3 py-1 rounded">Save</button>
            <button onClick={handleEditToggle} className="text-sm bg-gray-300 px-3 py-1 rounded">Cancel</button>
          </div>
        </div>
      ) : (
        <div onClick={handleReadMore} className="cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{post.title}</h3>
          <p className="text-sm text-gray-600 mb-2">
            {snippet}
            {isLong && <span className="text-grey-600 hover:underline ml-1">Read more</span>}
          </p>
        </div>
      )}

      <div className="mt-auto flex justify-between items-center text-xs text-gray-600">
        <span>By {post.author ? post.author.username : "Unknown Author"}</span>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        ❤️ {post.likes?.length || 0} Likes
        💬 {post.comment?.length || 0} Comments
      </div>

      {/* Delete Confirmation */}
      {showConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center rounded">
          <div className="bg-white p-4 rounded shadow text-center">
            <p className="mb-4 text-sm">Are you sure you want to delete this post?</p>
            <div className="flex gap-4 justify-center">
              <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-1 rounded">Delete</button>
              <button onClick={() => setShowConfirm(false)} className="bg-gray-300 px-4 py-1 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostCard;

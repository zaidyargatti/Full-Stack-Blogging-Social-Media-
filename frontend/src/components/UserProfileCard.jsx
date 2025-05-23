import { FiSettings } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from '../utils/Axios';

const UserProfileCard = () => {
  const { user, setUser } = useAuth();
  const [postCount, setPostCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      fetchPostCount(user._id);
    }
  }, [user]);

  const fetchPostCount = async (userId) => {
    try {
      const res = await axios.get(`/api/auth/${userId}`);
      setPostCount(res.data.postCount);
    } catch (err) {
      console.error("Failed to load post count:", err);
    }
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("username", username);
      if (selectedFile) {
        formData.append("profilePic", selectedFile);
      }
      console.log(formData);

      const res = await axios.put("/api/auth/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUser((prev) => ({
        ...prev,
        username: res.data.username,
        profilePic: res.data.profilePic,
      }));

      setIsEditing(false);
      setSelectedFile(null);
      setPreviewImage(null);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const handleCancel = () => {
    setUsername(user.username);
    setIsEditing(false);
    setPreviewImage(null);
    setSelectedFile(null);
  };

  if (!user) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-gray-600">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-16">
    <div className="flex flex-col md:flex-row items-start gap-6">
      {/* Profile Picture */}
      <div className="w-24 h-24 rounded-full border border-gray-400 bg-gray-200 overflow-hidden relative">
        {isEditing && (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setSelectedFile(file);
                  const reader = new FileReader();
                  reader.onloadend = () => setPreviewImage(reader.result);
                  reader.readAsDataURL(file);
                }
              }}
              className="absolute w-full h-full opacity-0 cursor-pointer"
            />
            <span className="text-xs text-gray-600 absolute bottom-1 text-center w-full">Change</span>
          </>
        )}
        {previewImage ? (
          <img src={previewImage} alt="Preview" className="object-cover w-full h-full" />
        ) : user.profilePic ? (
          <img
            src={user.profilePic}
            alt="Profile"
            className="rounded-full w-full h-full object-cover"
          />
        ) : null}
      </div>
  
      {/* Username & Stats */}
      <div className="flex-1">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
          {isEditing ? (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="text-xl font-semibold border border-gray-300 rounded px-3 py-1 w-full md:w-64"
            />
          ) : (
            <h2 className="text-2xl font-semibold text-black">@{user.username}</h2>
          )}
  
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleUpdate}
                  className="bg-blue-500 text-white px-4 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Update
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-200 text-black px-4 py-1 rounded text-sm hover:shadow"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-gray-200 text-black px-4 py-1 rounded text-sm hover:shadow"
              >
                Edit profile
              </button>
            )}
          </div>
        </div>
  
        {/* Stats */}
        <div className="flex gap-6 mt-2 text-gray-700 text-sm">
          <p><strong>{postCount}</strong> posts</p>
          <p><strong>{user.followers?.length || 0}</strong> followers</p>
          <p><strong>{user.following?.length || 0}</strong> following</p>
        </div>
      </div>
    </div>
  </div>
  
  
  
  );
};

export default UserProfileCard;

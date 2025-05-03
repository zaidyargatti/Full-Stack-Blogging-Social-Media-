import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import axios from './utils/Axios';
import UserProfileCard from './UserProfileCard';

function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('/api/post/all');
      setPosts(res.data.posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((post) => post._id !== deletedId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <UserProfileCard />
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Your Posts</h2>
          <button
            className="bg-gray-200 text-black px-4 py-2 rounded text-sm hover:shadow-lg"
            onClick={() => window.location.href = '/create-post'}
          >
            + Create Post
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Loading posts...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  showActions={true} // ✅ enable edit/delete
                  onPostDeleted={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                />
              ))
            ) : (
              <div className="text-center text-gray-500 col-span-3">No posts found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

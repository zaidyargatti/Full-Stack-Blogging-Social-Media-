import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../utils/Axios';
import PublicProfileCard from '../components/PublicProfileCard';
import PostCard from '../components/PostCard';
import Navbar from '../components/Navbar';

const UserProfilePage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get(`/api/auth/${id}`);
        setUser(data.user);
        setPosts(data.posts);
      } catch (err) {
        setError('Failed to load user data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading user profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <>
    <Navbar />
    <div className="min-h-screen">
      <PublicProfileCard userId={id} />
      {/* <div className="max-w-5xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-semibold mb-6"> Posts</h2>

        {Array.isArray(posts) && posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">This user hasn't posted anything yet.</div>
        )}
      </div> */}
    </div>
    </>
  );
};

export default UserProfilePage;

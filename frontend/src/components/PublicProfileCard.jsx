import { useEffect, useState } from 'react';
import axios from './utils/Axios';
import { useAuth } from '../context/Authcontext';
import PostCard from './PostCard';
import { useSocket } from '../context/SocketContext';

function PublicProfileCard({ userId }) {
  const { user: loggedInUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const socket = useSocket();

  const showFollowBack =
    !isFollowing && profile?.following?.includes(loggedInUser._id);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/auth/${userId}`);
        setProfile(res.data.user);
        if (res.data.user.followers.includes(loggedInUser._id)) {
          setIsFollowing(true);
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };

    const fetchUserPosts = async () => {
      try {
        const res = await axios.get(`/api/post/user/${userId}`);
        setPosts(res.data.posts);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    };

    if (loggedInUser?._id !== userId) {
      fetchProfile();
      fetchUserPosts();
    }

    if (!socket || !loggedInUser?._id) return;

    const handleFollowChange = ({ followerId, followeeId, isFollowing }) => {
      if (followeeId === userId && followerId === loggedInUser._id) {
        // A is viewing B’s profile and A followed/unfollowed B
        setIsFollowing(isFollowing);
        setProfile((prev) => {
          if (!prev) return prev;
          let updatedFollowers = isFollowing
            ? [...prev.followers, followerId]
            : prev.followers.filter((id) => id !== followerId);
          return { ...prev, followers: updatedFollowers };
        });
      }

      if (followerId === userId && followeeId === loggedInUser._id) {
        // B followed/unfollowed A, while A is viewing B's profile
        setProfile((prev) => {
          if (!prev) return prev;
          let updatedFollowing = isFollowing
            ? [...prev.following, followeeId]
            : prev.following.filter((id) => id !== followeeId);
          return { ...prev, following: updatedFollowing };
        });
      }
    };

    socket.on('followStatusChanged', handleFollowChange);
    return () => socket.off('followStatusChanged', handleFollowChange);
  }, [userId, loggedInUser, socket]);

  const handleFollow = async () => {
    try {
      await axios.post(`/api/auth/${userId}/follow`);
      setIsFollowing(true);
      setProfile((prev) => ({
        ...prev,
        followers: [...prev.followers, loggedInUser._id],
      }));

      // emit socket event with both IDs
      socket.emit('followStatusChanged', {
        followerId: loggedInUser._id,
        followeeId: userId,
        isFollowing: true,
      });
    } catch (err) {
      console.error('Follow failed:', err);
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.post(`/api/auth/${userId}/unfollow`);
      setIsFollowing(false);
      setProfile((prev) => ({
        ...prev,
        followers: prev.followers.filter((id) => id !== loggedInUser._id),
      }));
      setShowConfirm(false);

      // emit socket event with both IDs
      socket.emit('followStatusChanged', {
        followerId: loggedInUser._id,
        followeeId: userId,
        isFollowing: false,
      });
    } catch (err) {
      console.error('Unfollow failed:', err);
    }
  };

  if (!profile) return null;

  return (
    <div className="ml-60 mt-6 w-5xl rounded-xl border-none p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="w-24 h-24 rounded-full border border-gray-400 bg-gray-200 overflow-hidden">
          {profile.profilePic ? (
            <img
              src={profile.profilePic}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
              No Image
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-x-10">
            <h2 className="text-2xl font-semibold text-black">@{profile.username}</h2>
            {loggedInUser._id !== userId && (
              <div className="flex gap-3">
                {isFollowing ? (
                  <>
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="bg-gray-200 text-black px-4 py-1 rounded-md text-sm hover:shadow-lg"
                    >
                      Following
                    </button>
                    {showConfirm && (
                      <div className="mt-2 p-4 bg-white border rounded shadow-lg absolute right-4 z-50">
                        <p className="mb-2 text-sm text-gray-800">Unfollow @{profile.username}?</p>
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setShowConfirm(false)} className="text-gray-500 hover:underline">
                            Cancel
                          </button>
                          <button onClick={handleUnfollow} className="text-red-500 hover:underline font-semibold">
                            Unfollow
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={handleFollow}
                    className={`px-4 py-1 rounded-md text-sm text-white ${
                      showFollowBack ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {showFollowBack ? 'Follow Back' : 'Follow'}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-6 mt-4 text-gray-700 text-sm">
            <p><strong>{posts.length}</strong> posts</p>
            <p><strong>{profile.followers?.length || 0}</strong> followers</p>
            <p><strong>{profile.following?.length || 0}</strong> following</p>
          </div>
        </div>
      </div>

      {/* POSTS SECTION */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4">Posts</h3>
        {loadingPosts ? (
          <p className="text-gray-500">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-500 text-center mt-6">
            This user hasn't posted anything yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicProfileCard;

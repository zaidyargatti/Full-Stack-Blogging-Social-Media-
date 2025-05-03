import { useEffect, useState } from 'react';
import axios from '../utils/Axios';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useAuth();
  const { clearUnread } = useNotification(); // ✅ clear red dot

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notification');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await axios.put('/api/notification/read');
      fetchNotifications(); // refresh UI
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    clearUnread(); // ✅ remove red dot when visiting page
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('newNotification', () => {
        console.log("📡 Real-time notification received");
        fetchNotifications();
      });

      return () => {
        socket.off('newNotification');
      };
    }
  }, [socket]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Notifications</h2>
          <button
            onClick={handleMarkAsRead}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Mark all as read
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-500">No notifications yet.</div>
        ) : (
          <ul className="space-y-4">
            {notifications.map((n) => (
              <li
                key={n._id}
                className={`p-4 rounded shadow-sm border ${
                  n.isread ? 'bg-white' : 'bg-blue-50 border-blue-300'
                }`}
              >
                <p className="text-gray-700">
                  <Link
                    to={`/user/${n.sender?._id}`}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    @{n.sender?.username}
                  </Link>{' '}
                  {n.type === 'like' && 'liked your post'}
                  {n.type === 'comment' && 'commented on your post'}
                  {n.type === 'follow' && 'started following you'}
                  {n.post && (
                    <>
                      {' '}
                      on{' '}
                      <Link
                        to={`/post/${n.post._id}`}
                        className="text-blue-500 hover:underline font-medium"
                      >
                        "{n.post.title}"
                      </Link>
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default NotificationPage;

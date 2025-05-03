import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';


function SearchUsers() {
  const { user: loggedInUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!query.trim()) return; // skip empty queries
  
      try {
        const res = await axios.get(`/api/auth/search?query=${query}`);
        setUsers(res.data.user || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
  
    fetchUsers();
  }, [query]);

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4">Search User</h2>

        <input
          type="text"
          placeholder="Search by username or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border p-3 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((user) => (
              <div
                key={user._id}
                onClick={() =>
                  user._id === loggedInUser._id
                    ? navigate('/dashboard')
                    : navigate(`/auth/${user._id}`)
                }
                className="p-4 bg-white rounded shadow hover:shadow-md cursor-pointer transition"
              >
                <h3 className="font-semibold text-lg">@{user.username}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No users found.</p>
        )}
      </div>
    </div>
  );
}

export default SearchUsers;

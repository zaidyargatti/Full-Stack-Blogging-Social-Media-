import { useState, useEffect } from 'react';
import Button from '../components/Button';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

function CreatePost() {
  const { user, loading, } = useAuth(); // Ensure the `checkAuth` method is available to validate the user's session
  const [form, setForm] = useState({ title: '', description: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  

  // If the user is still loading, show a loading state
  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  // If the user is not authenticated, show the message
  if (!user) {
    return <div>You must be logged in to create a post.</div>;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/post/create-Post', form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-semibold mb-6">Create New Post</h2>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-3 mb-4 rounded border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            placeholder="Post Title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            name="description"
            placeholder="Post Description"
            value={form.description}
            onChange={handleChange}
            rows="6"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit" className="w-full">
            Publish Post
          </Button>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;

import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './components/Dashboard';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import SearchUsers from './pages/SearchUsers';
import UserProfilePage from './pages/UserProfilePage';
import NotificationPage from './pages/NotificationPage';
import PublicProfilePage from './pages/PublicProfilePage';
import NotificationPopup from './components/NotificationPopup';


function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
      <Route path="/post/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
      <Route path="/search-users" element={<ProtectedRoute><SearchUsers /></ProtectedRoute>} />
      <Route path="/auth/:id" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
      <Route path="/user/:id" element={<ProtectedRoute><PublicProfilePage /></ProtectedRoute>} />
    </Routes>
    <NotificationPopup />
    </>
   
  );
}

export default App;

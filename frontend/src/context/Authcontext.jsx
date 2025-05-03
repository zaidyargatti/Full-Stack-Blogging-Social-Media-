import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // loading state added

  useEffect(() => {
    
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);
  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/auth/check'); // ✅ secure check
      setUser(res.data.user);
    } catch (err) {
      console.error('Auth check failed:', err);
      logout(); 
    } finally {
      setLoading(false);
    }
  };
  console.log("✅ AuthContext.jsx loaded correctly");


  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
    
  );

};

export const useAuth = () => useContext(AuthContext);

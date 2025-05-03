import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://full-stack-blogging-social-media.onrender.com', 
  withCredentials:true// or whatever your backend URL is
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default instance;


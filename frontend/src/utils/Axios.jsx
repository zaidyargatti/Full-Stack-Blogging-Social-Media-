import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000', 
  withCredentials:true// or whatever your backend URL is
});

instance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default instance;


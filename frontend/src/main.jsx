import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import SearchUsers from './pages/SearchUsers.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    <AuthProvider>
    <SocketProvider>
      <NotificationProvider>
      <App />
      </NotificationProvider>
    </SocketProvider>
    </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

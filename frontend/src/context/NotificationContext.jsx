// src/context/NotificationContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const socket = useSocket();
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data) => {
      setPopupContent(data);
      setShowPopup(true);
      setHasUnread(true);

      setTimeout(() => {
        setShowPopup(false);
        setPopupContent(null);
      }, 5000);
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket]);

  const clearUnread = () => setHasUnread(false);

  return (
    <NotificationContext.Provider value={{ showPopup, popupContent, hasUnread, clearUnread }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

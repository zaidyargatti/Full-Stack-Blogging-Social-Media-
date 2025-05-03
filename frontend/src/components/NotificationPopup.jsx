import { useNotification } from '../context/NotificationContext';

function NotificationPopup() {
  const { showPopup, popupContent } = useNotification();

  if (!showPopup || !popupContent) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-white border shadow-lg rounded px-4 py-2 z-50 animate-bounce-in">
      <p className="text-sm text-gray-700">
        <strong>@{popupContent.sender}</strong>{' '}
        {popupContent.type === 'like' && 'liked your post'}
        {popupContent.type === 'comment' && 'commented on your post'}
        {popupContent.type === 'follow' && 'started following you'}
      </p>
    </div>
  );
}

export default NotificationPopup;

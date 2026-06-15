import React, { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Обновляем уведомления каждые 30 секунд
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
      const unread = data.filter((n) => n.status === 'pending').length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter((n) => n._id !== id));
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Уведомления</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Нет уведомлений
              </div>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification._id}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {notification.type}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.email}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${
                          notification.status === 'sent'
                            ? 'bg-green-100 text-green-800'
                            : notification.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {notification.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 text-center">
              <a
                href="/notifications"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Показать все
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
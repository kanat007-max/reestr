import React, { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, sent, failed, pending

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки уведомлений');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter((n) => n._id !== id));
    } catch (err) {
      setError('Ошибка удаления уведомления');
      console.error(err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const updated = await notificationService.markAsRead(id);
      setNotifications(
        notifications.map((n) => (n._id === id ? updated : n))
      );
    } catch (err) {
      setError('Ошибка обновления уведомления');
      console.error(err);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      confirmEmail: 'Подтверждение email',
      resetPassword: 'Сброс пароля',
      newOrder: 'Новый заказ',
      orderStatusUpdate: 'Обновление статуса',
      adminNotification: 'Уведомление администратора',
    };
    return labels[type] || type;
  };

  const filteredNotifications =
    filter === 'all'
      ? notifications
      : notifications.filter((n) => n.status === filter);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Центр уведомлений</h1>
          <p className="text-gray-600 mt-1">Управляйте вашими email уведомлениями</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-2 flex-wrap">
            {['all', 'sent', 'pending', 'failed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === f
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f === 'all'
                  ? 'Все'
                  : f === 'sent'
                    ? 'Отправлено'
                    : f === 'pending'
                      ? 'В ожидании'
                      : 'Ошибка'}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Загрузка...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Нет уведомлений</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {getTypeLabel(notification.type)}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(
                            notification.status
                          )}`}
                        >
                          {notification.status === 'sent'
                            ? 'Отправлено'
                            : notification.status === 'pending'
                              ? 'В ожидании'
                              : 'Ошибка'}
                        </span>
                      </div>
                      <p className="text-gray-600">{notification.email}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleString('ru-RU')}
                      </p>
                      {notification.error && (
                        <p className="text-sm text-red-600 mt-2">Ошибка: {notification.error}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      {notification.status === 'pending' && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                        >
                          Отметить
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
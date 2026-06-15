import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReportStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reports/stats`
      );
      setStats(response.data);
    } catch (err) {
      setError('Ошибка загрузки статистики');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">{error}</div>;
  }

  const statItems = [
    {
      label: 'Всего заказов',
      value: stats?.totalOrders || 0,
      icon: '📦',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      label: 'Завершено',
      value: stats?.completedOrders || 0,
      icon: '✅',
      color: 'bg-green-100 text-green-800',
    },
    {
      label: 'В ожидании',
      value: stats?.pendingOrders || 0,
      icon: '⏳',
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      label: 'Пользователей',
      value: stats?.totalUsers || 0,
      icon: '👥',
      color: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{item.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{item.value}</p>
              </div>
              <div className="text-4xl">{item.icon}</div>
            </div>
            <div className={`mt-4 px-3 py-1 rounded-full text-sm font-medium inline-block ${item.color}`}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportStats;
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/notifications`;

class NotificationService {
  // Получить все уведомления
  async getNotifications() {
    try {
      const response = await axios.get(`${API_URL}/my-notifications`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Получить одно уведомление
  async getNotification(id) {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  }

  // Пометить как прочитанное
  async markAsRead(id) {
    try {
      const response = await axios.put(`${API_URL}/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Удалить уведомление
  async deleteNotification(id) {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

export default new NotificationService();
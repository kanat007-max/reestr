import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reports`;

class ReportService {
  // Получить список доступных форматов
  async getFormats() {
    try {
      const response = await axios.get(`${API_URL}/formats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching formats:', error);
      throw error;
    }
  }

  // Экспорт заказов
  async exportOrders(format, filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(
        `${API_URL}/orders/${format}?${params.toString()}`,
        {
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error exporting orders:', error);
      throw error;
    }
  }

  // Экспорт пользователей
  async exportUsers(format) {
    try {
      const response = await axios.get(`${API_URL}/users/${format}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting users:', error);
      throw error;
    }
  }

  // Создать пользовательский отчет
  async exportCustom(format, data, title) {
    try {
      const response = await axios.post(
        `${API_URL}/custom/${format}`,
        { data, title },
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting custom report:', error);
      throw error;
    }
  }

  // Получить статистику
  async getStats() {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  // Скачать файл
  downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export default new ReportService();
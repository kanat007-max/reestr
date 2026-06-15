import React, { useState } from 'react';
import axios from 'axios';

const ReportExporter = () => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [reportType, setReportType] = useState('orders');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const formats = [
    { value: 'pdf', label: 'PDF', icon: '📄' },
    { value: 'excel', label: 'Excel', icon: '📊' },
    { value: 'csv', label: 'CSV', icon: '📋' },
    { value: 'json', label: 'JSON', icon: '{ }' },
  ];

  const reportTypes = [
    { value: 'orders', label: 'Экспорт заказов' },
    { value: 'users', label: 'Экспорт пользователей' },
  ];

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const params = new URLSearchParams();
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (status) params.append('status', status);

      const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reports/${reportType}/${selectedFormat}?${params.toString()}`;

      const response = await axios.get(url, {
        responseType: 'blob',
      });

      // Создаем ссылку и скачиваем файл
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `report_${Date.now()}.${selectedFormat}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка экспорта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Экспорт отчетов</h1>
          <p className="text-gray-600 mt-1">Загрузите данные в удобном формате</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              ✓ Отчет успешно скачан!
            </div>
          )}

          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Тип отчета
            </label>
            <div className="grid grid-cols-2 gap-3">
              {reportTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setReportType(type.value)}
                  className={`p-3 border-2 rounded-lg text-left font-medium transition ${
                    reportType === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4">Фильтры</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата от
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата до
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {reportType === 'orders' && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Статус
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Все статусы</option>
                    <option value="pending">В ожидании</option>
                    <option value="processing">В обработке</option>
                    <option value="completed">Завершено</option>
                    <option value="cancelled">Отменено</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Формат экспорта
            </label>
            <div className="grid grid-cols-4 gap-3">
              {formats.map((fmt) => (
                <button
                  key={fmt.value}
                  onClick={() => setSelectedFormat(fmt.value)}
                  className={`p-4 border-2 rounded-lg text-center font-medium transition ${
                    selectedFormat === fmt.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-2xl mb-1">{fmt.icon}</div>
                  <div className="text-sm">{fmt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Format Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Информация о формате:</h4>
            {selectedFormat === 'pdf' && (
              <p className="text-sm text-blue-800">
                📄 <strong>PDF</strong> - Портативный формат с форматированием и таблицами. Идеален для печати и обмена.
              </p>
            )}
            {selectedFormat === 'excel' && (
              <p className="text-sm text-blue-800">
                📊 <strong>Excel</strong> - Microsoft Excel с форматированием ячеек, цветом и формулами. Идеален для анализа данных.
              </p>
            )}
            {selectedFormat === 'csv' && (
              <p className="text-sm text-blue-800">
                📋 <strong>CSV</strong> - Простой текстовый формат. Идеален для импорта в другие системы.
              </p>
            )}
            {selectedFormat === 'json' && (
              <p className="text-sm text-blue-800">
                {'{}'} <strong>JSON</strong> - Структурированный формат с метаданными. Идеален для API и программирования.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <button
            onClick={handleExport}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-medium text-white transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {loading ? 'Загрузка...' : `Скачать ${selectedFormat.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportExporter;
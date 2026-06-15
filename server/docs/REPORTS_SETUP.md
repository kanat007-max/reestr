# Экспорт отчетов

## Установка зависимостей

```bash
npm install pdfkit exceljs csv-writer
```

## Поддерживаемые форматы

### 1. PDF
- Профессиональный внешний вид
- Готов к печати
- Встроенные таблицы и информация
- Компактный размер

```javascript
await reportService.exportOrders('pdf', {
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
```

### 2. Excel (XLSX)
- Форматированные ячейки
- Цветные заголовки
- Поддержка формул
- Удобен для анализа данных

```javascript
await reportService.exportOrders('excel', {
  status: 'completed'
});
```

### 3. CSV
- Простой текстовый формат
- Универсальная совместимость
- Легко импортировать в другие системы
- Минимальный размер файла

```javascript
await reportService.exportOrders('csv');
```

### 4. JSON
- Структурированный формат
- Включает метаданные
- Удобен для API
- Полная информация о наборе данных

```javascript
await reportService.exportOrders('json');
```

## API Endpoints

### Экспорт заказов
```
POST /api/reports/orders/:format
Query params:
  - dateFrom: YYYY-MM-DD
  - dateTo: YYYY-MM-DD
  - status: pending|processing|completed|cancelled
```

### Экспорт пользователей (только админ)
```
POST /api/reports/users/:format
Query params:
  - dateFrom: YYYY-MM-DD
  - dateTo: YYYY-MM-DD
```

### Пользовательский отчет
```
POST /api/reports/custom/:format
Body:
{
  "data": [...],
  "title": "Название отчета"
}
```

### Получить статистику
```
GET /api/reports/stats
```

### Доступные форматы
```
GET /api/reports/formats
```

## Примеры использования

### React Component
```javascript
import ReportExporter from './components/ReportExporter';

function App() {
  return <ReportExporter />;
}
```

### Backend использование
```javascript
const reportService = require('./services/reportService');

// Экспорт в PDF
const pdfPath = await reportService.generateReport(
  'pdf',
  orders,
  'orders_report',
  {
    title: 'Отчет по заказам',
    companyInfo: { 'Компания': 'ООО Пример' }
  }
);

// Экспорт в Excel
const excelPath = await reportService.generateReport(
  'excel',
  orders,
  'orders_report',
  { title: 'Отчет по заказам' }
);
```

## Фильтры

### По датам
```javascript
const blob = await reportService.exportOrders('pdf', {
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
```

### По статусу
```javascript
const blob = await reportService.exportOrders('excel', {
  status: 'completed'
});
```

### Комбинированные
```javascript
const blob = await reportService.exportOrders('csv', {
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  status: 'pending'
});
```

## Производительность

- **Лимит размера**: До 10,000 строк на отчет
- **Время генерации**: 1-5 секунд в зависимости от размера
- **Размер файла**:
  - PDF: 50-500 KB
  - Excel: 100-800 KB
  - CSV: 50-300 KB
  - JSON: 100-1 MB

## Автоматическая очистка

Отчеты старше 24 часов автоматически удаляются каждый час.

```javascript
const { cleanupOldReports } = require('./services/reportService');

// Очистить отчеты старше 12 часов
cleanupOldReports(12);
```

## Безопасность

- ✅ Требуется аутентификация
- ✅ Проверка роли (админ для некоторых отчетов)
- ✅ Валидация входных данных
- ✅ Удаление файлов после скачивания
- ✅ Лимиты на размер данных

## Troubleshooting

### "Cannot find module 'pdfkit'"
```bash
npm install pdfkit
```

### PDF не генерируется
- Проверьте, что данные переданы корректно
- Убедитесь, что директория `reports` существует
- Проверьте права доступа на запись

### Excel файл поврежден
- Попробуйте другой формат
- Проверьте структуру данных
- Убедитесь, что все ячейки содержат валидные данные

### CSV с кириллицей показывает иероглифы
- Excel: При открытии выберите кодировку UTF-8
- В Google Sheets: Файл → Импорт → Загрузить

## Интеграция с системой

### server/index.js
```javascript
const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);
```

### Дополнительные возможности
- Планирование отчетов (например, ежедневно в 9:00)
- Отправка отчетов по email
- Хранение архива отчетов
- Кастомизация шаблонов
- Водяные знаки в PDF

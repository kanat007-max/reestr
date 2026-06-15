# Email Notifications Setup

## Описание

Эта документация описывает настройку системы email уведомлений для приложения Reestr.

## Установка зависимостей

```bash
npm install nodemailer
```

## Конфигурация

### 1. Gmail Setup (рекомендуется)

1. Перейдите на https://myaccount.google.com/apppasswords
2. Выберите приложение: "Mail"
3. Выберите устройство: "Windows Computer" (или ваше устройство)
4. Скопируйте сгенерированный пароль
5. Добавьте в `.env`:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=<ваш_app_password>
```

### 2. Другие Email сервисы

#### SendGrid
```env
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your_sendgrid_key
```

#### Mailgun
```env
EMAIL_SERVICE=mailgun
EMAIL_API_KEY=your_mailgun_key
```

#### SMTP (Custom)
```env
EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password
EMAIL_SECURE=false
```

## Использование

### Отправка email уведомления

```javascript
const { sendNotification } = require('../middleware/notificationMiddleware');

// Отправить уведомление
await sendNotification(
  userId,
  userEmail,
  'newOrder',
  { orderId: '123', status: 'pending', description: 'Test order' },
  orderId
);
```

### Доступные типы уведомлений

1. **confirmEmail** - Подтверждение email адреса
   - Параметры: `token`

2. **resetPassword** - Сброс пароля
   - Параметры: `token`

3. **newOrder** - Новый заказ
   - Параметры: `orderData` (orderId, createdAt, status, description)

4. **orderStatusUpdate** - Обновление статуса заказа
   - Параметры: `orderData` (orderId, status, updatedAt, comment)

5. **adminNotification** - Уведомление администратора
   - Параметры: `notificationData` (title, message, data)

## API Endpoints

### Получить уведомления
```
GET /api/notifications/my-notifications
```

### Получить уведомление
```
GET /api/notifications/:id
```

### Пометить как прочитанное
```
PUT /api/notifications/:id/read
```

### Удалить уведомление
```
DELETE /api/notifications/:id
```

## Тестирование

### Тестовое письмо

```javascript
const { sendEmail } = require('./services/emailService');

await sendEmail('confirmEmail', 'test@example.com', { token: 'test-token' });
```

### Проверка логов

```bash
# Просмотр всех отправленных уведомлений
db.notifications.find()

# Просмотр неудачных уведомлений
db.notifications.find({ status: 'failed' })

# Просмотр уведомлений пользователя
db.notifications.find({ userId: ObjectId('...') })
```

## Troubleshooting

### Gmail: "Less secure app access"

Если используется обычный пароль (не app password):
1. Включите "Less secure app access": https://myaccount.google.com/lesssecureapps

### EAUTH ошибка

- Проверьте корректность EMAIL_USER и EMAIL_PASSWORD
- Убедитесь, что Email сервис включен
- Проверьте подключение к интернету

### Письма не приходят

1. Проверьте, что email не ушел в спам
2. Проверьте логи сервера: `console.log('Email sent:', info.response)`
3. Убедитесь, что адрес email верен
4. Проверьте БД на предмет статуса уведомления

## Security

- Никогда не коммитьте реальные пароли в `.env.example`
- Используйте app passwords вместо основного пароля
- Ограничьте права доступа к email сервису
- Валидируйте email адреса перед отправкой

## Production

1. Используйте professional email сервис (SendGrid, Mailgun и т.д.)
2. Настройте retry logic для неудачных отправок
3. Используйте очереди (Bull, RabbitMQ) для async отправки
4. Добавьте rate limiting
5. Логируйте все отправки и ошибки
6. Мониторьте bounce rate и unsubscribes

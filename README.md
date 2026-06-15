# Reestr - Import Requests Management System

Приложение для управления заявками на ввоз на территорию с системой ролей и рабочих процессов.

## Функциональность

### Роли пользователей

1. **Админ** - управление пользователями, назначение проверяющих, просмотр всех заявок
2. **Инициатор** - создание и управление собственными заявками на ввоз
3. **Проверяющий** - рассмотрение и одобрение/отклонение заявок

### Статусы заявки

- `draft` - черновик (только инициатор может редактировать)
- `submitted` - отправлена (ожидает назначения проверяющего)
- `under_review` - на рассмотрении (проверяющий рассматривает)
- `approved` - одобрена
- `rejected` - отклонена
- `completed` - завершена

## Установка

### Требования

- Node.js >= 14
- MongoDB >= 4.0

### Backend Setup

```bash
# Установить зависимости
npm install

# Создать .env файл
cp .env.example .env

# Заполнить .env с вашими параметрами MongoDB и JWT секретом
```

### Запуск

```bash
# Production
npm start

# Development
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Получить текущего пользователя

### Requests

- `GET /api/requests` - Получить заявки (отфильтрованные по роли)
- `GET /api/requests/:id` - Получить заявку
- `POST /api/requests` - Создать заявку (Инициатор)
- `PUT /api/requests/:id` - Обновить черновик (Инициатор)
- `PATCH /api/requests/:id/submit` - Отправить заявку (Инициатор)
- `PATCH /api/requests/:id/assign-checker` - Назначить проверяющего (Админ)
- `PATCH /api/requests/:id/review` - Одобрить/Отклонить (Проверяющий)
- `DELETE /api/requests/:id` - Удалить черновик (Инициатор)

### Users

- `GET /api/users` - Получить всех пользователей (Админ)
- `GET /api/users/checkers` - Получить проверяющих
- `PATCH /api/users/:id/role` - Изменить роль пользователя (Админ)
- `PATCH /api/users/:id/deactivate` - Деактивировать пользователя (Админ)

## Структура проекта

```
reestr/
├── server/
│   ├── models/
│   │   ├── User.js
│   │   └── Request.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── requests.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   └── index.js
├── client/                    # React приложение (следует добавить)
├── .env.example
├── .gitignore
└── package.json
```

## Следующие шаги

1. Создать React frontend приложение
2. Добавить загрузку файлов
3. Добавить email уведомления
4. Добавить экспорт отчетов
5. Развернуть на сервер

## License

ISC

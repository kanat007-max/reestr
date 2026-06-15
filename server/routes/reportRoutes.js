const express = require('express');
const router = express.Router();
const reportService = require('../services/reportService');
const { authenticate } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// ============ Модель данных для отчетов ============
// Здесь должны быть импорты ваших моделей
// const Order = require('../models/Order');
// const User = require('../models/User');

// ============ Эндпоинт: Экспорт заказов ============
router.post('/orders/:format', authenticate, async (req, res) => {
  try {
    const { format } = req.params;
    const { dateFrom, dateTo, status } = req.query;

    // Здесь должна быть логика получения заказов из БД
    // const query = { userId: req.user.id };
    // if (dateFrom || dateTo) {
    //   query.createdAt = {};
    //   if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    //   if (dateTo) query.createdAt.$lte = new Date(dateTo);
    // }
    // if (status) query.status = status;
    // const orders = await Order.find(query);

    const orders = [
      {
        orderId: '123',
        status: 'pending',
        createdAt: new Date(),
        description: 'Test order 1',
      },
      {
        orderId: '124',
        status: 'completed',
        createdAt: new Date(),
        description: 'Test order 2',
      },
    ];

    const filename = `orders_${Date.now()}`;
    const filepath = await reportService.generateReport(
      format,
      orders,
      filename,
      {
        title: 'Отчет по заказам',
        companyInfo: {
          'Пользователь': req.user.email || 'Unknown',
          'Период': `${dateFrom || 'Начало'} - ${dateTo || 'Сейчас'}`,
        },
      }
    );

    // Отправляем файл
    res.download(filepath, `orders_report.${format}`, (err) => {
      if (err) console.error('Error sending file:', err);
      // Удаляем файл после отправки
      setTimeout(() => {
        try {
          fs.unlinkSync(filepath);
        } catch (e) {
          console.error('Error deleting file:', e);
        }
      }, 1000);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Эндпоинт: Экспорт пользователей (только для админа) ============
router.post('/users/:format', authenticate, async (req, res) => {
  try {
    // Проверка что пользователь админ
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { format } = req.params;
    const { dateFrom, dateTo } = req.query;

    // Здесь должна быть логика получения пользователей из БД
    // const users = await User.find({});

    const users = [
      {
        _id: '1',
        email: 'user1@example.com',
        name: 'User 1',
        createdAt: new Date(),
      },
      {
        _id: '2',
        email: 'user2@example.com',
        name: 'User 2',
        createdAt: new Date(),
      },
    ];

    const filename = `users_${Date.now()}`;
    const filepath = await reportService.generateReport(
      format,
      users,
      filename,
      {
        title: 'Отчет по пользователям',
      }
    );

    res.download(filepath, `users_report.${format}`, (err) => {
      if (err) console.error('Error sending file:', err);
      setTimeout(() => {
        try {
          fs.unlinkSync(filepath);
        } catch (e) {
          console.error('Error deleting file:', e);
        }
      }, 1000);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Эндпоинт: Пользовательский отчет ============
router.post('/custom/:format', authenticate, async (req, res) => {
  try {
    const { format } = req.params;
    const { data, title } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Data must be an array' });
    }

    const filename = `custom_${Date.now()}`;
    const filepath = await reportService.generateReport(
      format,
      data,
      filename,
      {
        title: title || 'Пользовательский отчет',
        companyInfo: {
          'Создан': new Date().toLocaleString('ru-RU'),
          'Записей': data.length,
        },
      }
    );

    res.download(filepath, `report.${format}`, (err) => {
      if (err) console.error('Error sending file:', err);
      setTimeout(() => {
        try {
          fs.unlinkSync(filepath);
        } catch (e) {
          console.error('Error deleting file:', e);
        }
      }, 1000);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Эндпоинт: Статистика (JSON) ============
router.get('/stats', authenticate, async (req, res) => {
  try {
    // Здесь должна быть логика получения статистики
    const stats = {
      totalOrders: 150,
      completedOrders: 120,
      pendingOrders: 30,
      totalUsers: 45,
      avgOrderValue: 1250,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Эндпоинт: Доступные форматы ============
router.get('/formats', (req, res) => {
  res.json({
    formats: ['pdf', 'excel', 'csv', 'json'],
    descriptions: {
      pdf: 'Портативный формат документов',
      excel: 'Microsoft Excel формат с форматированием',
      csv: 'Простой текстовый формат для импорта',
      json: 'JSON формат с метаданными',
    },
  });
});

module.exports = router;
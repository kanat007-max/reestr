const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');

// Получить все уведомления пользователя
router.get('/my-notifications', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить уведомление по ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Проверка прав доступа
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Пометить уведомление как прочитанное
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить уведомление
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
const Notification = require('../models/Notification');
const { sendEmail } = require('../services/emailService');

// Middleware для логирования отправки уведомлений
const logNotification = async (userId, email, type, data, relatedOrderId = null) => {
  try {
    const notification = new Notification({
      userId,
      email,
      type,
      status: 'pending',
      data,
      relatedOrderId,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error logging notification:', error);
    throw error;
  }
};

// Функция для отправки и логирования уведомления
const sendNotification = async (userId, email, type, data, relatedOrderId = null) => {
  try {
    // Логируем уведомление
    const notification = await logNotification(userId, email, type, data, relatedOrderId);

    // Отправляем email
    const result = await sendEmail(type, email, data);

    // Обновляем статус
    notification.status = 'sent';
    notification.messageId = result.messageId;
    await notification.save();

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);

    // Обновляем статус на failed
    try {
      const notification = await Notification.findOne({
        userId,
        email,
        type,
        status: 'pending',
      }).sort({ createdAt: -1 });

      if (notification) {
        notification.status = 'failed';
        notification.error = error.message;
        await notification.save();
      }
    } catch (updateError) {
      console.error('Error updating notification status:', updateError);
    }

    throw error;
  }
};

module.exports = {
  logNotification,
  sendNotification,
};
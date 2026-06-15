const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Конфигурация email сервиса
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Проверка подключения
transporter.verify((error, success) => {
  if (error) {
    console.log('Email service error:', error);
  } else {
    console.log('Email service ready:', success);
  }
});

const emailTemplates = {
  // Шаблон подтверждения регистрации
  confirmEmail: (email, token) => ({
    to: email,
    subject: 'Подтверждение регистрации',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Добро пожаловать в Reestr!</h2>
        <p>Спасибо за регистрацию. Пожалуйста, подтвердите вашу email адрес:</p>
        <a href="${process.env.CLIENT_URL}/confirm-email/${token}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          Подтвердить Email
        </a>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Ссылка действительна 24 часа.
        </p>
      </div>
    `,
  }),

  // Шаблон сброса пароля
  resetPassword: (email, token) => ({
    to: email,
    subject: 'Сброс пароля',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Сброс пароля</h2>
        <p>Вы запросили сброс пароля. Нажмите на ссылку ниже:</p>
        <a href="${process.env.CLIENT_URL}/reset-password/${token}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          Сбросить пароль
        </a>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Если вы не запрашивали сброс пароля, проигнорируйте это письмо.
        </p>
      </div>
    `,
  }),

  // Шаблон уведомления о новом заказе
  newOrder: (email, orderData) => ({
    to: email,
    subject: `Новый заказ №${orderData.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Ваш заказ создан</h2>
        <p>Спасибо за вашу заявку!</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Номер заказа:</strong> ${orderData.orderId}</p>
          <p><strong>Дата:</strong> ${new Date(orderData.createdAt).toLocaleDateString('ru-RU')}</p>
          <p><strong>Статус:</strong> ${orderData.status}</p>
          <p><strong>Описание:</strong> ${orderData.description}</p>
        </div>
        <p>Мы свяжемся с вами в ближайшее время.</p>
      </div>
    `,
  }),

  // Шаблон обновления статуса заказа
  orderStatusUpdate: (email, orderData) => ({
    to: email,
    subject: `Заказ №${orderData.orderId}: ${orderData.status}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Обновление статуса заказа</h2>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Номер заказа:</strong> ${orderData.orderId}</p>
          <p><strong>Новый статус:</strong> <span style="color: #007bff; font-weight: bold;">${orderData.status}</span></p>
          <p><strong>Дата обновления:</strong> ${new Date(orderData.updatedAt).toLocaleDateString('ru-RU')}</p>
          ${orderData.comment ? `<p><strong>Комментарий:</strong> ${orderData.comment}</p>` : ''}
        </div>
      </div>
    `,
  }),

  // Шаблон уведомления для администратора
  adminNotification: (email, notificationData) => ({
    to: email,
    subject: `[Admin] ${notificationData.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${notificationData.title}</h2>
        <p>${notificationData.message}</p>
        ${notificationData.data ? `<pre style="background-color: #f5f5f5; padding: 10px;">${JSON.stringify(notificationData.data, null, 2)}</pre>` : ''}
      </div>
    `,
  }),
};

// Функция отправки email
const sendEmail = async (type, email, data) => {
  try {
    if (!emailTemplates[type]) {
      throw new Error(`Unknown email template: ${type}`);
    }

    const mailOptions = emailTemplates[type](email, data);
    const info = await transporter.sendMail(mailOptions);

    console.log(`Email sent: ${info.response}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Функция для отправки массовых уведомлений
const sendBulkEmails = async (type, emails, data) => {
  try {
    const results = await Promise.allSettled(
      emails.map((email) => sendEmail(type, email, data))
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return { successful, failed, results };
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  transporter,
};
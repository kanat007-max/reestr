const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'confirmEmail',
        'resetPassword',
        'newOrder',
        'orderStatusUpdate',
        'adminNotification',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    subject: String,
    messageId: String,
    error: String,
    relatedOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    data: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
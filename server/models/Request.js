const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requestNumber: {
    type: String,
    unique: true,
    required: true,
  },
  initiatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  goods: [
    {
      name: String,
      quantity: Number,
      unit: String,
      hsCode: String,
    },
  ],
  territory: {
    type: String,
    required: true,
  },
  importDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'completed'],
    default: 'draft',
  },
  checkerComments: {
    type: String,
  },
  assignedChecker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  attachments: [
    {
      fileName: String,
      fileUrl: String,
      uploadedAt: Date,
    },
  ],
  history: [
    {
      status: String,
      changedBy: mongoose.Schema.Types.ObjectId,
      changedAt: Date,
      comment: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Request', requestSchema);

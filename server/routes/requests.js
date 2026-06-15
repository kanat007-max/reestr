const express = require('express');
const Request = require('../models/Request');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Create request (Initiator)
router.post('/', authenticate, authorize('initiator', 'admin'), async (req, res) => {
  try {
    const { title, description, goods, territory, importDate } = req.body;

    const requestNumber = `REQ-${Date.now()}`;

    const newRequest = new Request({
      requestNumber,
      initiatorId: req.userId,
      title,
      description,
      goods,
      territory,
      importDate,
      status: 'draft',
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all requests (with role-based filtering)
router.get('/', authenticate, async (req, res) => {
  try {
    let query = {};

    if (req.userRole === 'initiator') {
      query.initiatorId = req.userId;
    } else if (req.userRole === 'checker') {
      query.assignedChecker = req.userId;
    }

    const requests = await Request.find(query)
      .populate('initiatorId', 'firstName lastName email organization')
      .populate('assignedChecker', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single request
router.get('/:id', authenticate, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('initiatorId', 'firstName lastName email organization')
      .populate('assignedChecker', 'firstName lastName email')
      .populate('history.changedBy', 'firstName lastName');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update request (Initiator - draft only)
router.put('/:id', authenticate, authorize('initiator', 'admin'), async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'draft' && request.initiatorId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Can only edit draft requests' });
    }

    Object.assign(request, req.body);
    request.updatedAt = Date.now();

    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit request (Initiator)
router.patch('/:id/submit', authenticate, authorize('initiator', 'admin'), async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft requests can be submitted' });
    }

    request.status = 'submitted';
    request.history.push({
      status: 'submitted',
      changedBy: req.userId,
      changedAt: Date.now(),
    });

    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign checker (Admin)
router.patch('/:id/assign-checker', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { checkerId } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.assignedChecker = checkerId;
    request.status = 'under_review';
    request.history.push({
      status: 'under_review',
      changedBy: req.userId,
      changedAt: Date.now(),
    });

    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve/Reject (Checker)
router.patch('/:id/review', authenticate, authorize('checker', 'admin'), async (req, res) => {
  try {
    const { action, comment } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    request.status = newStatus;
    request.checkerComments = comment;
    request.history.push({
      status: newStatus,
      changedBy: req.userId,
      changedAt: Date.now(),
      comment,
    });

    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete request (Initiator - draft only)
router.delete('/:id', authenticate, authorize('initiator', 'admin'), async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'draft') {
      return res.status(400).json({ message: 'Can only delete draft requests' });
    }

    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

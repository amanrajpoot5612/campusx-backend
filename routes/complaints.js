const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createComplaint,
  getComplaints,
  getComplaint,
  updateComplaintStatus,
  upvoteComplaint,
  deleteComplaint,
  getAnalytics
} = require('../controllers/complaintController');

router.get('/', getComplaints);
router.get('/analytics', auth(['admin']), getAnalytics);
router.get('/:id', getComplaint);

router.post('/', auth, upload.single('image'), createComplaint);
router.put('/:id/upvote', auth, upvoteComplaint);
router.put('/:id', auth(['admin']), updateComplaintStatus);
router.delete('/:id', auth, deleteComplaint);

module.exports = router;

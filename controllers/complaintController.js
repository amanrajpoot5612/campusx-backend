const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const Log = require('../models/Log');
const classifyComplaint = require('../services/classifier');
const { notifyComplaintCreated, notifyStatusChange } = require('../services/emailService');

exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const detectedCategory = category || classifyComplaint(title + ' ' + description);

    const complaint = new Complaint({
      title,
      description,
      category: detectedCategory,
      imageUrl,
      createdBy: req.user.id
    });

    await complaint.save();

    await Log.create({ complaintId: complaint._id, action: 'Created', performedBy: req.user.id });

    notifyComplaintCreated(complaint).catch(() => {});

    const io = req.app.get('io');
    io.emit('newComplaint', complaint);

    res.status(201).json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const { status, category, search, createdBy, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (createdBy) query.createdBy = createdBy;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('createdBy', 'name collegeId')
        .populate('assignedToDepartment', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Complaint.countDocuments(query)
    ]);

    res.json({ complaints, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('createdBy', 'name collegeId email')
      .populate('assignedToDepartment', 'name');

    if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });

    res.json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, assignedToDepartment } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });

    const oldStatus = complaint.status;
    if (status) complaint.status = status;
    if (assignedToDepartment) complaint.assignedToDepartment = assignedToDepartment;

    await complaint.save();

    await Log.create({
      complaintId: complaint._id,
      action: `Status changed to ${status}`,
      performedBy: req.user.id
    });

    if (status && status !== oldStatus) {
      notifyStatusChange(complaint, status).catch(() => {});
    }

    const io = req.app.get('io');
    io.emit('statusUpdate', { complaintId: complaint._id, status: complaint.status });

    res.json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.upvoteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });

    if (complaint.upvotes.map(String).includes(String(req.user.id))) {
      return res.status(400).json({ msg: 'Already upvoted' });
    }

    complaint.upvotes.push(req.user.id);
    await complaint.save();

    res.json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });

    if (complaint.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await complaint.deleteOne();
    res.json({ msg: 'Complaint removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const [totalComplaints, pending, inProgress, resolved, byCategory, byDepartment, topUpvoted, recentComplaints] =
      await Promise.all([
        Complaint.countDocuments(),
        Complaint.countDocuments({ status: 'Pending' }),
        Complaint.countDocuments({ status: 'In Progress' }),
        Complaint.countDocuments({ status: 'Resolved' }),
        Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
        Complaint.aggregate([
          { $match: { assignedToDepartment: { $ne: null } } },
          { $group: { _id: '$assignedToDepartment', count: { $sum: 1 } } },
          { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
          { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
          { $project: { name: '$dept.name', count: 1 } }
        ]),
        Complaint.find()
          .sort({ 'upvotes': -1 })
          .limit(5)
          .populate('createdBy', 'name'),
        Complaint.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('createdBy', 'name collegeId')
          .populate('assignedToDepartment', 'name')
      ]);

    res.json({
      totalComplaints,
      pending,
      inProgress,
      resolved,
      byCategory,
      byDepartment,
      topUpvoted,
      recentComplaints
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

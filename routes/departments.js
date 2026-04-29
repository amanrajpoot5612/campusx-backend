const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDepartments, createDepartment, seedDepartments } = require('../controllers/departmentController');

router.get('/', getDepartments);
router.post('/', auth(['admin']), createDepartment);
router.post('/seed', seedDepartments);

module.exports = router;
const Department = require('../models/Department');

// Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create department (admin only)
exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    const department = new Department({ name, description });
    await department.save();
    res.json(department);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Seed default departments
exports.seedDepartments = async () => {
  const defaultDepartments = [
    { name: 'IT', description: 'Information Technology and Network' },
    { name: 'Maintenance', description: 'Building and Infrastructure Maintenance' },
    { name: 'Electrical', description: 'Electrical and Power' },
    { name: 'Security', description: 'Campus Security' },
    { name: 'Library', description: 'Library Services' },
    { name: 'Cafeteria', description: 'Food and Catering' },
    { name: 'Transport', description: 'Transportation' },
    { name: 'Academic', description: 'Academic Affairs' }
  ];

  for (const dept of defaultDepartments) {
    await Department.findOneAndUpdate({ name: dept.name }, dept, { upsert: true });
  }
  console.log('Departments seeded');
};
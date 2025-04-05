const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Connect to MongoDB (`arun` database)
mongoose.connect('mongodb://localhost:27017/arun')
  .then(() => console.log("✅ Connected to MongoDB (Database: arun)"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// 🔹 Updated Employee Schema (with present_days, no attendance array)
const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  present_days: { type: Number, default: 0 }
});

const Employee = mongoose.model('Employee', employeeSchema);

// 🔹 Attendance API Endpoint
app.post('/attendance', async (req, res) => {
  const { employeeId, name, department } = req.body;

  if (!employeeId || !name || !department) {
    return res.status(400).json({ error: "❌ Missing required fields" });
  }

  try {
    let employee = await Employee.findOne({ employeeId });

    if (!employee) {
      // First-time scan: create employee with present_days = 1
      employee = new Employee({
        employeeId,
        name,
        department,
        present_days: 1
      });
    } else {
      // Increment present_days
      employee.present_days = (employee.present_days || 0) + 1;
    }

    await employee.save();
    res.json({
      message: `✅ Attendance updated for ${employee.name} (ID: ${employee.employeeId}), Present Days: ${employee.present_days}`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "❌ Database error" });
  }
});

// 🔹 Start Server
app.listen(5000, '0.0.0.0', () =>
  console.log("🚀 Server running on http://192.168.29.119")
);

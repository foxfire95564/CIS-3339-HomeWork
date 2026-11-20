
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const path = require('path')
const fs = require('fs')

const Student = require('./models/Student')
const Course = require('./models/Course')
const Enrollment = require('./models/Enrollment')

const app = express()

app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3000

// ==========================================
// STUDENT API
// ==========================================

// Get all students
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 })
    res.json(students)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Unable to load students' })
  }
})

// Add a new student
app.post('/api/students', async (req, res) => {
  try {
    const { name, studentId, phone, zip } = req.body

    if (
      typeof name !== 'string' ||
      typeof studentId !== 'string' ||
      typeof phone !== 'string' ||
      typeof zip !== 'string' ||
      !name.trim() ||
      !studentId.trim() ||
      !phone.trim() ||
      !zip.trim()
    ) {
      return res.status(400).json({
        error: 'Name, Student ID, Phone, and ZIP are required'
      })
    }

    const student = await Student.create({
      name: name.trim(),
      studentId: studentId.trim(),
      phone: phone.trim(),
      zip: zip.trim()
    })

    res.status(201).json(student)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'A student with this Student ID already exists'
      })
    }

    console.error(error)
    res.status(500).json({ error: 'Unable to add student' })
  }
})

// Delete a student and associated enrollments
app.delete('/api/students/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: 'Invalid student ID'
      })
    }

    const student = await Student.findByIdAndDelete(req.params.id)

    if (!student) {
      return res.status(404).json({
        error: 'Student not found'
      })
    }

    await Enrollment.deleteMany({
      student: student._id
    })

    res.json({
      message: 'Student and associated enrollments deleted successfully'
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Unable to delete student' })
  }
})

// ==========================================
// COURSE API
// ==========================================

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ courseId: 1 })
    res.json(courses)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Unable to load courses' })
  }
})

// Add a new course
app.post('/api/courses', async (req, res) => {
  try {
    const { courseId, courseName } = req.body

    if (
      typeof courseId !== 'string' ||
      typeof courseName !== 'string' ||
      !courseId.trim() ||
      !courseName.trim()
    ) {
      return res.status(400).json({
        error: 'Course ID and Course Name are required'
      })
    }

    const course = await Course.create({
      courseId: courseId.trim(),
      courseName: courseName.trim()
    })

    res.status(201).json(course)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'A course with this ID already exists'
      })
    }

    console.error(error)
    res.status(500).json({ error: 'Unable to add course' })
  }
})

// Delete a course and associated enrollments
app.delete('/api/courses/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: 'Invalid course ID'
      })
    }

    const course = await Course.findByIdAndDelete(req.params.id)

    if (!course) {
      return res.status(404).json({
        error: 'Course not found'
      })
    }

    await Enrollment.deleteMany({
      course: course._id
    })

    res.json({
      message: 'Course and associated enrollments deleted successfully'
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Unable to delete course' })
  }
})

// ==========================================
// ENROLLMENT API
// ==========================================

// Get all enrollments
app.get('/api/enrollments', async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('student', 'name studentId')
      .populate('course', 'courseId courseName')

    res.json(enrollments)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Unable to load enrollments' })
  }
})

// Enroll a student in a course
app.post('/api/enrollments', async (req, res) => {
  try {
    const { studentId, courseId } = req.body

    if (
      !mongoose.isValidObjectId(studentId) ||
      !mongoose.isValidObjectId(courseId)
    ) {
      return res.status(400).json({
        error: 'Valid Student and Course selections are required'
      })
    }

    const student = await Student.findById(studentId)
    const course = await Course.findById(courseId)

    if (!student || !course) {
      return res.status(404).json({
        error: 'Student or course not found'
      })
    }

    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    })

    if (existingEnrollment) {
      return res.status(409).json({
        error: 'Student is already enrolled in this course'
      })
    }

    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId
    })

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('student', 'name studentId')
      .populate('course', 'courseId courseName')

    res.status(201).json(populatedEnrollment)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Student is already enrolled in this course'
      })
    }

    console.error(error)
    res.status(500).json({ error: 'Unable to enroll student' })
  }
})

// Get students enrolled in a specific course
app.get('/api/enrollments/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        error: 'Invalid course ID'
      })
    }

    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({
        error: 'Course not found'
      })
    }

    const enrollments = await Enrollment.find({ course: courseId })
      .populate('student', 'name studentId phone zip')
      .populate('course', 'courseId courseName')

    res.json(enrollments)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Unable to load course roster' })
  }
})

// Remove an enrollment
app.delete('/api/enrollments/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: 'Invalid enrollment ID'
      })
    }

    const enrollment = await Enrollment.findByIdAndDelete(req.params.id)

    if (!enrollment) {
      return res.status(404).json({
        error: 'Enrollment not found'
      })
    }

    res.json({
      message: 'Enrollment removed successfully'
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Unable to remove enrollment' })
  }
})

// ==========================================
// PRODUCTION FRONTEND
// ==========================================

// Locate Vue production build
const frontendPath = path.join(__dirname, '..', 'frontend-vue', 'dist')
const frontendIndex = path.join(frontendPath, 'index.html')

// Serve compiled JavaScript, CSS, and other static assets
app.use(express.static(frontendPath))

// Return JSON for unknown API endpoints
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' })
})

// Handle Vue Router navigation and browser refreshes
app.get('/{*path}', (req, res) => {
  if (!fs.existsSync(frontendIndex)) {
    return res.status(503).send(
      'Frontend build not found. Run npm run build inside frontend-vue.'
    )
  }

  res.sendFile(frontendIndex)
})

// ==========================================
// DATABASE CONNECTION AND SERVER
// ==========================================

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from backend/.env')
    }

    await mongoose.connect(process.env.MONGO_URI)

    // Create indexes required for duplicate prevention
    await Promise.all([
      Student.init(),
      Course.init(),
      Enrollment.init()
    ])

    console.log('Connected to MongoDB')

    app.listen(PORT, '127.0.0.1', () => {
      console.log(`Server running at http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Unable to start server:', error)
    process.exit(1)
  }
}

startServer()

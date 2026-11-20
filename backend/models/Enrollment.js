
const mongoose = require('mongoose')

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  }
}, {
  timestamps: true
})

// Prevent a student from enrolling twice in the same course
enrollmentSchema.index(
  { student: 1, course: 1 },
  { unique: true }
)

module.exports = mongoose.model('Enrollment', enrollmentSchema)

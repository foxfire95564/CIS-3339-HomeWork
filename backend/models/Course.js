
const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  }
})

module.exports = mongoose.model('Course', courseSchema)

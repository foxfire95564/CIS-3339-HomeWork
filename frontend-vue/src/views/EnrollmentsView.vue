
<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCourseStore } from '../stores/course'
import StatusMessage from '../components/StatusMessage.vue'

const courseStore = useCourseStore()
const { courses } = storeToRefs(courseStore)

const students = ref([])
const enrollments = ref([])
const enrolledStudents = ref([])

const enrollmentStudentId = ref('')
const enrollmentCourseId = ref('')
const viewCourseId = ref('')

const enrollmentMessage = ref('')
const enrollmentError = ref('')
const removeMessage = ref('')
const removeError = ref('')
const rosterError = ref('')
const saving = ref(false)
const loading = ref(false)

// Load students from the backend
async function loadStudents() {
  const response = await fetch('/api/students')

  if (!response.ok) {
    throw new Error('Unable to load students')
  }

  students.value = await response.json()
}

// Load all enrollments
async function loadEnrollments() {
  const response = await fetch('/api/enrollments')

  if (!response.ok) {
    throw new Error('Unable to load enrollments')
  }

  enrollments.value = await response.json()
}

// Enroll a student in a course
async function enrollStudent() {
  enrollmentMessage.value = ''
  enrollmentError.value = ''

  if (!enrollmentStudentId.value || !enrollmentCourseId.value) {
    enrollmentError.value = 'Please select a student and course.'
    return
  }

  saving.value = true

  try {
    const response = await fetch('/api/enrollments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        studentId: enrollmentStudentId.value,
        courseId: enrollmentCourseId.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Unable to enroll student')
    }

    enrollmentMessage.value = 'Student enrolled successfully.'
    enrollmentStudentId.value = ''
    enrollmentCourseId.value = ''

    await loadEnrollments()

    if (viewCourseId.value) {
      await viewRoster()
    }
  } catch (err) {
    enrollmentError.value = err.message
  } finally {
    saving.value = false
  }
}

// View students enrolled in a selected course
async function viewRoster() {
  rosterError.value = ''
  enrolledStudents.value = []

  if (!viewCourseId.value) {
    return
  }

  try {
    const response = await fetch(
      `/api/enrollments/course/${encodeURIComponent(viewCourseId.value)}`
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Unable to load course roster')
    }

    enrolledStudents.value = data
  } catch (err) {
    rosterError.value = err.message
  }
}

// Remove an enrollment without deleting the student
async function removeEnrollment(id) {
  removeMessage.value = ''
  removeError.value = ''

  if (!confirm('Remove this student from the course?')) {
    return
  }

  try {
    const response = await fetch(
      `/api/enrollments/${encodeURIComponent(id)}`,
      {
        method: 'DELETE'
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Unable to remove enrollment')
    }

    removeMessage.value = 'Enrollment removed successfully.'

    await loadEnrollments()

    if (viewCourseId.value) {
      await viewRoster()
    }
  } catch (err) {
    removeError.value = err.message
  }
}

// Load initial data when the page opens
onMounted(async () => {
  loading.value = true
  enrollmentError.value = ''

  try {
    await Promise.all([
      courseStore.fetchCourses(),
      loadStudents(),
      loadEnrollments()
    ])

    if (courseStore.error) {
      enrollmentError.value = courseStore.error
    }
  } catch (err) {
    enrollmentError.value = err.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="page-heading">
      <h1>Enrollment Management</h1>
      <p>Connect students to courses and manage enrollment records.</p>
    </div>

    <div class="two-column">
      <div class="hero-card">
        <div class="hero-icon">📝</div>

        <h2>Connect students with courses.</h2>

        <p>
          Enroll students, review academic rosters, and
          manage course participation in one workspace.
        </p>

        <div class="hero-feature">✓ Student Enrollment</div>
        <div class="hero-feature">✓ Duplicate Enrollment Protection</div>
        <div class="hero-feature">✓ Course Roster Management</div>
      </div>

      <div class="dashboard-card">
        <h2>Enroll Student</h2>

        <p class="card-subtitle">
          Choose a student and the course they will attend.
        </p>

        <form @submit.prevent="enrollStudent">
          <div class="form-group">
            <label for="enroll-student">Select Student</label>

            <select
              id="enroll-student"
              v-model="enrollmentStudentId"
              class="form-control"
              required
            >
              <option value="">Choose a student</option>

              <option
                v-for="student in students"
                :key="student._id"
                :value="student._id"
              >
                {{ student.name }} ({{ student.studentId }})
              </option>
            </select>
          </div>

          <div class="form-group" style="margin-top: 16px">
            <label for="enroll-course">Select Course</label>

            <select
              id="enroll-course"
              v-model="enrollmentCourseId"
              class="form-control"
              required
            >
              <option value="">Choose a course</option>

              <option
                v-for="course in courses"
                :key="course._id"
                :value="course._id"
              >
                {{ course.courseId }} - {{ course.courseName }}
              </option>
            </select>
          </div>

          <button
            type="submit"
            class="primary-btn full-width"
            :disabled="saving || loading"
          >
            {{ saving ? 'Enrolling...' : '+ Enroll Student' }}
          </button>
        </form>

        <StatusMessage :message="enrollmentMessage" type="success" />
        <StatusMessage :message="enrollmentError" type="error" />
      </div>
    </div>

    <div class="dashboard-card section-space">
      <div class="table-toolbar">
        <div>
          <h2>All Enrollments</h2>

          <p class="card-subtitle" style="margin: 0">
            {{ enrollments.length }} enrollment record(s)
          </p>
        </div>
      </div>

      <p v-if="loading">Loading enrollments...</p>

      <div v-else class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Student ID</th>
              <th>Course</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="enrollment in enrollments"
              :key="enrollment._id"
            >
              <td>
                <strong>
                  {{ enrollment.student?.name || 'Unknown Student' }}
                </strong>
              </td>

              <td>
                <span class="id-tag">
                  {{ enrollment.student?.studentId || 'N/A' }}
                </span>
              </td>

              <td>
                {{ enrollment.course?.courseId || 'N/A' }}
              </td>

              <td>
                <button
                  type="button"
                  class="danger-btn"
                  @click="removeEnrollment(enrollment._id)"
                >
                  Remove
                </button>
              </td>
            </tr>

            <tr v-if="enrollments.length === 0">
              <td colspan="4" class="empty-row">
                No enrollments found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <StatusMessage :message="removeMessage" type="success" />
      <StatusMessage :message="removeError" type="error" />
    </div>

    <div class="dashboard-card section-space">
      <h2>Course Roster</h2>

      <p class="card-subtitle">
        Select a course to view its enrolled students.
      </p>

      <div class="form-group">
        <label for="roster-course">Course</label>

        <select
          id="roster-course"
          v-model="viewCourseId"
          class="form-control"
          @change="viewRoster"
        >
          <option value="">Select a course</option>

          <option
            v-for="course in courses"
            :key="course._id"
            :value="course._id"
          >
            {{ course.courseId }} - {{ course.courseName }}
          </option>
        </select>
      </div>

      <StatusMessage :message="rosterError" type="error" />

      <div
        v-if="viewCourseId"
        class="table-scroll section-space"
      >
        <table class="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Student ID</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="enrollment in enrolledStudents"
              :key="enrollment._id"
            >
              <td>
                <strong>
                  {{ enrollment.student?.name }}
                </strong>
              </td>

              <td>
                <span class="id-tag">
                  {{ enrollment.student?.studentId }}
                </span>
              </td>
            </tr>

            <tr v-if="enrolledStudents.length === 0">
              <td colspan="2" class="empty-row">
                No students enrolled in this course.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

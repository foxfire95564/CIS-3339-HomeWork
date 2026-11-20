
<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useStudentStore } from '../stores/student'
import StatusMessage from '../components/StatusMessage.vue'

const studentStore = useStudentStore()
const { students, loading, error } = storeToRefs(studentStore)

const name = ref('')
const studentId = ref('')
const phone = ref('')
const zip = ref('')
const search = ref('')

const message = ref('')
const actionError = ref('')
const saving = ref(false)

const filteredStudents = computed(() => {
  const query = search.value.toLowerCase().trim()

  if (!query) return students.value

  return students.value.filter(student =>
    student.name?.toLowerCase().includes(query) ||
    student.studentId?.toLowerCase().includes(query) ||
    student.phone?.includes(query) ||
    student.zip?.includes(query)
  )
})

async function handleAddStudent() {
  message.value = ''
  actionError.value = ''

  if (
    !name.value.trim() ||
    !studentId.value.trim() ||
    !phone.value.trim() ||
    !zip.value.trim()
  ) {
    actionError.value = 'Please complete all fields.'
    return
  }

  saving.value = true

  try {
    await studentStore.addStudent({
      name: name.value.trim(),
      studentId: studentId.value.trim(),
      phone: phone.value.trim(),
      zip: zip.value.trim()
    })

    if (studentStore.error) {
      throw new Error(studentStore.error)
    }

    message.value = 'Student registered successfully.'

    name.value = ''
    studentId.value = ''
    phone.value = ''
    zip.value = ''
  } catch (err) {
    actionError.value = err.message
  } finally {
    saving.value = false
  }
}

async function handleDeleteStudent(id) {
  message.value = ''
  actionError.value = ''

  if (!confirm('Delete this student and their enrollments?')) return

  try {
    await studentStore.deleteStudent(id)

    if (studentStore.error) {
      throw new Error(studentStore.error)
    }

    message.value = 'Student deleted successfully.'
  } catch (err) {
    actionError.value = err.message
  }
}

onMounted(() => {
  studentStore.fetchStudents()
})
</script>

<template>
  <div>
    <div class="page-heading">
      <h1>Student Management</h1>
      <p>Register students and manage academic records in one place.</p>
    </div>

    <div class="two-column">
      <div class="hero-card">
        <div class="hero-icon">🎓</div>

        <h2>Manage students with ease.</h2>

        <p>
          Welcome to your student management workspace.
          Register new students, organize their information,
          and keep academic records up to date.
        </p>

        <div class="hero-feature">
          ✓ Student Registration
        </div>

        <div class="hero-feature">
          ✓ Academic Record Management
        </div>

        <div class="hero-feature">
          ✓ MongoDB Data Storage
        </div>
      </div>

      <div class="dashboard-card">
        <h2>Register New Student</h2>

        <p class="card-subtitle">
          Enter the student's information to create a record.
        </p>

        <form @submit.prevent="handleAddStudent">
          <div class="form-grid">
            <div class="form-group">
              <label for="student-name">Full Name</label>
              <input
                id="student-name"
                v-model="name"
                class="form-control"
                type="text"
                placeholder="Enter full name"
                required
              />
            </div>

            <div class="form-group">
              <label for="student-id">Student ID</label>
              <input
                id="student-id"
                v-model="studentId"
                class="form-control"
                type="text"
                placeholder="e.g. 1003"
                required
              />
            </div>

            <div class="form-group">
              <label for="student-phone">Phone Number</label>
              <input
                id="student-phone"
                v-model="phone"
                class="form-control"
                type="tel"
                placeholder="555-1234"
                required
              />
            </div>

            <div class="form-group">
              <label for="student-zip">ZIP Code</label>
              <input
                id="student-zip"
                v-model="zip"
                class="form-control"
                type="text"
                placeholder="77001"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            class="primary-btn full-width"
            :disabled="saving"
          >
            {{ saving ? 'Registering...' : '+ Register Student' }}
          </button>
        </form>

        <!-- Reusable status messages -->
        <StatusMessage :message="message" type="success" />
        <StatusMessage :message="actionError" type="error" />
        <StatusMessage :message="error" type="error" />
      </div>
    </div>

    <div class="dashboard-card section-space">
      <div class="table-toolbar">
        <div>
          <h2>Student Directory</h2>

          <p class="card-subtitle" style="margin: 0">
            {{ students.length }} registered student(s)
          </p>
        </div>

        <input
          v-model="search"
          class="form-control search-input"
          type="search"
          placeholder="Search students..."
          aria-label="Search students"
        />
      </div>

      <p v-if="loading">Loading students...</p>

      <div v-else class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Student ID</th>
              <th>Phone</th>
              <th>ZIP Code</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="student in filteredStudents"
              :key="student._id"
            >
              <td>
                <strong>{{ student.name }}</strong>
              </td>

              <td>
                <span class="id-tag">
                  {{ student.studentId }}
                </span>
              </td>

              <td>{{ student.phone }}</td>
              <td>{{ student.zip }}</td>

              <td>
                <button
                  type="button"
                  class="danger-btn"
                  @click="handleDeleteStudent(student._id)"
                >
                  Delete
                </button>
              </td>
            </tr>

            <tr v-if="filteredStudents.length === 0">
              <td colspan="5" class="empty-row">
                No students found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

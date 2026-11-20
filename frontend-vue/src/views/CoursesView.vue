<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCourseStore } from '../stores/course'
import StatusMessage from '../components/StatusMessage.vue'

const courseStore = useCourseStore()
const { courses, loading, error } = storeToRefs(courseStore)

const courseId = ref('')
const courseName = ref('')
const search = ref('')
const message = ref('')
const actionError = ref('')
const saving = ref(false)

const filteredCourses = computed(() => {
  const query = search.value.toLowerCase().trim()

  if (!query) return courses.value

  return courses.value.filter(course =>
    course.courseId?.toLowerCase().includes(query) ||
    course.courseName?.toLowerCase().includes(query)
  )
})

async function handleAddCourse() {
  message.value = ''
  actionError.value = ''

  if (!courseId.value.trim() || !courseName.value.trim()) {
    actionError.value = 'Please complete all fields.'
    return
  }

  saving.value = true

  try {
    await courseStore.addCourse({
      courseId: courseId.value.trim(),
      courseName: courseName.value.trim()
    })

    if (courseStore.error) {
      throw new Error(courseStore.error)
    }

    message.value = 'Course added successfully.'
    courseId.value = ''
    courseName.value = ''
  } catch (err) {
    actionError.value = err.message
  } finally {
    saving.value = false
  }
}

async function handleDeleteCourse(id) {
  message.value = ''
  actionError.value = ''

  if (!confirm('Delete this course and its enrollments?')) return

  try {
    await courseStore.deleteCourse(id)

    if (courseStore.error) {
      throw new Error(courseStore.error)
    }

    message.value = 'Course deleted successfully.'
  } catch (err) {
    actionError.value = err.message
  }
}

onMounted(() => {
  courseStore.fetchCourses()
})
</script>

<template>
  <div>
    <div class="page-heading">
      <h1>Course Management</h1>
      <p>Create, search, and manage university courses.</p>
    </div>

    <div class="two-column">
      <div class="hero-card">
        <div class="hero-icon">📚</div>
        <h2>Organize your academic courses.</h2>
        <p>
          Create courses and keep your course catalog
          organized with a simple management workspace.
        </p>
        <div class="hero-feature">✓ Course Registration</div>
        <div class="hero-feature">✓ Duplicate Code Prevention</div>
        <div class="hero-feature">✓ Course Catalog Management</div>
      </div>

      <div class="dashboard-card">
        <h2>Add New Course</h2>
        <p class="card-subtitle">
          Enter the course information below.
        </p>

        <form @submit.prevent="handleAddCourse">
          <div class="form-group">
            <label for="course-id">Course ID</label>
            <input
              id="course-id"
              v-model="courseId"
              type="text"
              class="form-control"
              placeholder="e.g. CIS 3339"
              required
            />
          </div>

          <div class="form-group" style="margin-top: 16px">
            <label for="course-name">Course Name</label>
            <input
              id="course-name"
              v-model="courseName"
              type="text"
              class="form-control"
              placeholder="Enter course name"
              required
            />
          </div>

          <button
            type="submit"
            class="primary-btn full-width"
            :disabled="saving"
          >
            {{ saving ? 'Adding...' : '+ Add Course' }}
          </button>
        </form>

        <StatusMessage :message="message" type="success" />
        <StatusMessage :message="actionError" type="error" />
        <StatusMessage :message="error" type="error" />
      </div>
    </div>

    <div class="dashboard-card section-space">
      <div class="table-toolbar">
        <div>
          <h2>Course Catalog</h2>
          <p class="card-subtitle" style="margin: 0">
            {{ courses.length }} available course(s)
          </p>
        </div>

        <input
          v-model="search"
          type="search"
          class="form-control search-input"
          placeholder="Search courses..."
          aria-label="Search courses"
        />
      </div>

      <p v-if="loading">Loading courses...</p>

      <div v-else class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Course ID</th>
              <th>Course Name</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="course in filteredCourses" :key="course._id">
              <td>
                <span class="id-tag">{{ course.courseId }}</span>
              </td>
              <td><strong>{{ course.courseName }}</strong></td>
              <td>
                <button
                  type="button"
                  class="danger-btn"
                  @click="handleDeleteCourse(course._id)"
                >
                  Delete
                </button>
              </td>
            </tr>

            <tr v-if="filteredCourses.length === 0">
              <td colspan="3" class="empty-row">
                No courses found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
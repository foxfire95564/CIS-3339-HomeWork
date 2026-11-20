
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCourseStore = defineStore('course', () => {
  const courses = ref([])
  const loading = ref(false)
  const error = ref('')

  // Get all courses
  async function fetchCourses() {
    loading.value = true
    error.value = ''

    try {
      const response = await fetch('/api/courses')

      if (!response.ok) {
        throw new Error('Unable to load courses')
      }

      courses.value = await response.json()
    } catch (err) {
      error.value = err.message
      courses.value = []
    } finally {
      loading.value = false
    }
  }

  // Add a new course
  async function addCourse(course) {
    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(course)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Unable to add course')
    }

    await fetchCourses()
    return data
  }

  // Delete a course
  async function deleteCourse(id) {
    const response = await fetch(
      `/api/courses/${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    )

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Unable to delete course')
    }

    await fetchCourses()
  }

  return {
    courses,
    loading,
    error,
    fetchCourses,
    addCourse,
    deleteCourse
  }
})

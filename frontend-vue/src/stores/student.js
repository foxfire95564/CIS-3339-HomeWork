
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStudentStore = defineStore('student', () => {
  const students = ref([])
  const loading = ref(false)
  const error = ref('')

  // Get all students
  async function fetchStudents() {
    loading.value = true
    error.value = ''

    try {
      const response = await fetch('/api/students')

      if (!response.ok) {
        throw new Error('Unable to load students')
      }

      students.value = await response.json()
    } catch (err) {
      error.value = err.message
      students.value = []
    } finally {
      loading.value = false
    }
  }

  // Add a new student
  async function addStudent(student) {
    const response = await fetch('/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(student)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Unable to add student')
    }

    await fetchStudents()
    return data
  }

  // Delete a student
  async function deleteStudent(id) {
    const response = await fetch(
      `/api/students/${encodeURIComponent(id)}`,
      {
        method: 'DELETE'
      }
    )

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Unable to delete student')
    }

    await fetchStudents()
  }

  return {
    students,
    loading,
    error,
    fetchStudents,
    addStudent,
    deleteStudent
  }
})

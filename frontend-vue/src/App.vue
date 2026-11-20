
<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-icon">🎓</div>
        <div>
          <strong>Student Portal</strong>
          <small>CIS 3339 Management</small>
        </div>
      </div>

      <div class="sidebar-label">WORKSPACE</div>

      <nav class="sidebar-nav">
        <RouterLink to="/students">
          <span>👥</span> Students
        </RouterLink>

        <RouterLink to="/courses">
          <span>📚</span> Courses
        </RouterLink>

        <RouterLink to="/enrollments">
          <span>📝</span> Enrollments
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        University Management System
        <small>Enterprise Applications Development</small>
      </div>
    </aside>

    <div class="main-shell">
      <header class="topbar">
        <div>
          <span class="topbar-caption">ACADEMIC WORKSPACE</span>
          <strong>Student Course Management</strong>
        </div>
        <span class="topbar-pill">CIS 3339</span>
      </header>

      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

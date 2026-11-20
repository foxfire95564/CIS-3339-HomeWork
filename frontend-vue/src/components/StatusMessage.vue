
<script setup>
defineProps({
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'error'].includes(value)
  }
})
</script>

<template>
  <p
    v-if="message"
    class="notice"
    :class="type"
    :role="type === 'error' ? 'alert' : 'status'"
  >
    {{ message }}
  </p>
</template>

<template>
  <div class="message ai">
    <div class="msg-avatar">
      <i class="fa-solid fa-robot"></i>
    </div>
    <div class="msg-content">
      <div class="thinking-bar">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 思考指示器组件
</script>

<style scoped>
.message {
  display: flex;
  gap: 16px;
  opacity: 0;
  animation: slideIn 0.4s ease forwards;
}

.msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
  background: rgba(255,255,255,0.1);
  color: white;
}

.msg-content {
  padding: 12px 18px;
}

.thinking-bar {
  display: flex;
  gap: 4px;
  height: 20px;
  align-items: center;
}

.bar {
  width: 3px;
  height: 8px;
  background: var(--text-secondary);
  animation: pulse 1s infinite ease-in-out;
  border-radius: 2px;
}

.bar:nth-child(1) {
  animation-delay: 0.0s;
}

.bar:nth-child(2) {
  animation-delay: 0.2s;
}

.bar:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

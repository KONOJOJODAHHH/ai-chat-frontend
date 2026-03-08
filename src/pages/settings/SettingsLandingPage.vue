<template>
  <section class="settings-page glass-card">
    <div class="hero-block">
      <h2>欢迎来到设置中心</h2>
      <p>
        在这里你可以调整主题外观、管理账号信息、查看使用统计，以及配置 AI 模型与智能体偏好。
        请从左侧导航选择对应功能。
      </p>
    </div>
  </section>
</template>

<style scoped>
.settings-page {
  min-height: 100%; box-sizing: border-box;
  padding: 20px;
  display: flex;
  align-items: center;
}

.hero-block {
  max-width: 600px;
}

h2 {
  margin: 0 0 16px;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

p {
  margin: 0;
  line-height: 1.8;
  color: var(--text-secondary);
  font-size: 15px;
}
</style>

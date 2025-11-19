<template>
  <div class="register-container">
    <!-- Spline 3D 背景 -->
    <div class="spline-background">
      <Spline
        :scene="sceneUrl"
        class="spline-canvas"
      >
        <div class="spline-loading">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>
          <p class="loading-text">Loading...</p>
        </div>
      </Spline>
    </div>

    <!-- 品牌标识 -->
    <div class="brand-logo">
      <div class="logo-icon">
        <div class="logo-inner">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
      <div class="logo-text">
        <span class="logo-title">Matrix</span>
        <span class="logo-subtitle">AI Intelligence</span>
      </div>
    </div>

    <!-- 装饰元素 -->
    <div class="deco-elements">
      <!-- 连接线 -->
      <div class="connect-line"></div>
      
      <!-- 浮动粒子 -->
      <div class="particle particle-1"></div>
      <div class="particle particle-2"></div>
      <div class="particle particle-3"></div>
      <div class="particle particle-4"></div>
      <div class="particle particle-5"></div>
      <div class="particle particle-6"></div>
      
      <!-- 光晕效果 -->
      <div class="glow-orb glow-1"></div>
      <div class="glow-orb glow-2"></div>
    </div>

    <!-- 注册表单 -->
    <div class="form-wrapper">
      <div class="register-card">
        <div class="card-header">
          <h2 class="card-title">注册</h2>
        </div>
        
        <form @submit.prevent="onSubmit" class="register-form">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <div class="input-wrapper">
              <input 
                v-model="form.username" 
                type="text" 
                placeholder="请选择一个用户名"
                class="form-input"
                autocomplete="username"
              />
            </div>
            <span v-if="errors.username" class="error-text">
              <i class="fa-solid fa-circle-exclamation"></i>
              {{ errors.username }}
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">密码</label>
            <div class="input-wrapper">
              <input 
                v-model="form.password" 
                :type="showPassword ? 'text' : 'password'"
                placeholder="请创建一个密码"
                class="form-input"
                autocomplete="new-password"
              />
              <button 
                type="button" 
                class="password-toggle" 
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
              </button>
            </div>
            <span v-if="errors.password" class="error-text">
              <i class="fa-solid fa-circle-exclamation"></i>
              {{ errors.password }}
            </span>
            <div v-else-if="form.password" class="password-strength">
              <div class="strength-bar">
                <div class="strength-fill" :class="passwordStrength.level" :style="{ width: passwordStrength.percent }"></div>
              </div>
              <span class="strength-text" :class="passwordStrength.level">{{ passwordStrength.text }}</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">确认密码</label>
            <div class="input-wrapper">
              <input 
                v-model="form.confirm" 
                :type="showConfirm ? 'text' : 'password'"
                placeholder="请再次输入密码"
                class="form-input"
                autocomplete="new-password"
              />
              <button 
                type="button" 
                class="password-toggle" 
                @click="showConfirm = !showConfirm"
                tabindex="-1"
              >
                <i :class="showConfirm ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
              </button>
            </div>
            <span v-if="errors.confirm" class="error-text">
              <i class="fa-solid fa-circle-exclamation"></i>
              {{ errors.confirm }}
            </span>
            <span v-else-if="form.confirm && form.password === form.confirm" class="success-text">
              <i class="fa-solid fa-circle-check"></i>
              密码匹配
            </span>
          </div>

          <button 
            type="submit" 
            class="submit-btn" 
            :disabled="!canSubmit || loading"
          >
            <span v-if="!loading">创建账号</span>
            <span v-else class="loading-content">
              <span class="spinner-small"></span>
              <span>创建中...</span>
            </span>
          </button>
        </form>

        <div class="card-footer">
          <span class="footer-text">已有账号？</span>
          <router-link to="/login" class="link">立即登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { authAPI } from '@/utils/api'
import Spline from '@/components/Spline.vue'

const sceneUrl = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"

const router = useRouter()
const loading = ref(false)
const showPassword = ref(false)
const showConfirm = ref(false)
const form = ref({ username: '', password: '', confirm: '' })
const errors = ref<Record<string, string>>({})

const canSubmit = computed(() => 
  form.value.username.trim().length >= 2 && 
  form.value.password.length >= 6 && 
  form.value.password === form.value.confirm
)

const passwordStrength = computed(() => {
  const pwd = form.value.password
  if (!pwd) return { level: '', percent: '0%', text: '' }
  
  let strength = 0
  if (pwd.length >= 6) strength++
  if (pwd.length >= 10) strength++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
  if (/\d/.test(pwd)) strength++
  if (/[^a-zA-Z0-9]/.test(pwd)) strength++
  
  if (strength <= 1) return { level: 'weak', percent: '33%', text: '弱' }
  if (strength <= 3) return { level: 'medium', percent: '66%', text: '中' }
  return { level: 'strong', percent: '100%', text: '强' }
})

const validate = () => {
  errors.value = {}
  
  if (form.value.username.trim().length < 2) {
    errors.value.username = '用户名至少2个字符'
    return false
  }
  if (form.value.username.trim().length > 20) {
    errors.value.username = '用户名不能超过20个字符'
    return false
  }
  if (form.value.password.length < 6) {
    errors.value.password = '密码至少6位'
    return false
  }
  if (form.value.password.length > 50) {
    errors.value.password = '密码不能超过50位'
    return false
  }
  if (form.value.confirm !== form.value.password) {
    errors.value.confirm = '两次密码输入不一致'
    return false
  }
  
  return true
}

const onSubmit = async () => {
  if (!validate()) return
  
  try {
    loading.value = true
    await authAPI.register({ 
      username: form.value.username.trim(), 
      password: form.value.password 
    })
    
    ElMessage.success({
      message: '注册成功！即将跳转到登录页面...',
      duration: 2000,
    })
    
    setTimeout(() => router.replace('/login'), 2000)
  } catch (e) {
    ElMessage.error('注册失败，用户名可能已存在')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  --holo-primary: #6cfde4;
  --holo-secondary: #805bff;
  --holo-surface: rgba(4, 4, 4, 0.82);
  --grid-color: rgba(255, 255, 255, 0.04);
  background: radial-gradient(circle at 20% 20%, rgba(112, 209, 255, 0.25), rgba(0, 0, 0, 0.95) 55%), #000;
  display: flex;
  align-items: center;
  justify-content: center;
}


/* Spline 3D 背景 */
.spline-background {
  position: absolute;
  top: 0;
  left: -20%;
  width: 100%;
  height: 100%;
  z-index: 0;
}


.spline-canvas {
  width: 100%;
  height: 100%;
}

/* 加载动画 */
.spline-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

.spinner-ring:nth-child(2) {
  width: 60px;
  height: 60px;
  top: 10px;
  left: 10px;
  border-top-color: var(--accent-hover);
  animation-delay: 0.3s;
}

.spinner-ring:nth-child(3) {
  width: 40px;
  height: 40px;
  top: 20px;
  left: 20px;
  border-top-color: #fff;
  animation-delay: 0.6s;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: var(--accent-primary);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  animation: fadeInOut 2s ease-in-out infinite;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

/* 品牌标识 */
.brand-logo {
  position: absolute;
  top: 48px;
  left: 64px;
  display: flex;
  align-items: center;
  gap: 14px;
  z-index: 20;
  animation: logoFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.brand-logo:hover {
  transform: translateX(4px);
}

@keyframes logoFadeIn {
  from {
    opacity: 0;
    transform: translateX(-20px) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0) translateY(0);
  }
}

.logo-icon {
  position: relative;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.logo-icon::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover), var(--accent-primary));
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
}

.logo-icon:hover::before {
  opacity: 0.15;
}

.logo-icon::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.1), transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.logo-icon:hover::after {
  opacity: 1;
}

.logo-icon:hover {
  border-color: rgba(168, 199, 250, 0.3);
  box-shadow: 
    0 8px 24px rgba(168, 199, 250, 0.15),
    0 0 0 1px rgba(168, 199, 250, 0.1);
  transform: translateY(-1px);
}

.logo-inner {
  position: relative;
  width: 24px;
  height: 24px;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.logo-icon:hover .logo-inner {
  color: var(--accent-primary);
  transform: scale(1.05);
}

.logo-inner svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 8px rgba(168, 199, 250, 0.3));
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  transition: transform 0.3s ease;
}

.logo-title {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: -0.3px;
  line-height: 1;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  transition: color 0.3s ease;
}

.brand-logo:hover .logo-title {
  color: var(--accent-primary);
}

.logo-subtitle {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  line-height: 1;
  transition: color 0.3s ease;
}

.brand-logo:hover .logo-subtitle {
  color: rgba(255, 255, 255, 0.6);
}

/* 表单容器 */
.form-wrapper {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
  margin-left: 56%;
  padding: 20px;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 注册卡片 */
.register-card {
  position: relative;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: none;
  border-radius: 24px;
  padding: 40px 32px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

/* 卡片头部 */
.card-header {
  margin-bottom: 28px;
}

.status-text {
  font-weight: 500;
  letter-spacing: 0.5px;
}

.card-title {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: -0.5px;
}

/* 表单样式 */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 0.3px;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
  transition: all 0.3s;
  outline: none;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.form-input:hover {
  border-color: rgba(168, 199, 250, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

.form-input:focus {
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(168, 199, 250, 0.1);
}

.password-toggle {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 6px;
  transition: all 0.2s;
  border-radius: 6px;
}

.password-toggle:hover {
  color: var(--accent-primary);
  background: rgba(168, 199, 250, 0.1);
}

.error-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #ff6b6b;
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.success-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #51cf66;
}

/* 密码强度指示器 */
.password-strength {
  display: flex;
  align-items: center;
  gap: 12px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s;
  border-radius: 2px;
}

.strength-fill.weak {
  background: #ff6b6b;
}

.strength-fill.medium {
  background: #ffd43b;
}

.strength-fill.strong {
  background: #51cf66;
}

.strength-text {
  font-size: 12px;
  font-weight: 600;
  min-width: 30px;
}

.strength-text.weak {
  color: #ff6b6b;
}

.strength-text.medium {
  color: #ffd43b;
}

.strength-text.strong {
  color: #51cf66;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  padding: 16px;
  margin-top: 8px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(120deg, var(--holo-primary), var(--holo-secondary));
  color: #0a0a0a;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(128, 91, 255, 0.35);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(168, 199, 250, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #0a0a0a;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 底部 */
.card-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  text-align: center;
  font-size: 14px;
}

.footer-text {
  color: rgba(255, 255, 255, 0.5);
}

.link {
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 600;
  margin-left: 6px;
  transition: all 0.2s;
}

.link:hover {
  color: var(--accent-hover);
}

/* 装饰元素 */
.deco-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 5;
  overflow: hidden;
}

/* 连接线保留默认布局，不额外样式，避免干扰 */

@keyframes lineFlow {
  0%, 100% {
    opacity: 0.2;
    transform: translateY(-50%) scaleX(1);
  }
  50% {
    opacity: 0.6;
    transform: translateY(-50%) scaleX(1.1);
  }
}

/* 浮动粒子 */
.particle {
  position: absolute;
  width: var(--size, 6px);
  height: var(--size, 6px);
  border-radius: 999px;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(108, 253, 228, 0.25) 60%, transparent 85%);
  box-shadow:
    0 0 12px rgba(108, 253, 228, 0.6),
    0 0 32px rgba(128, 91, 255, 0.4);
  opacity: 0;
  animation: particleFloat var(--duration, 5s) cubic-bezier(0.42, 0, 0.58, 1) infinite;
  animation-delay: var(--delay, 0s);
  mix-blend-mode: screen;
  filter: drop-shadow(0 0 6px rgba(128, 91, 255, 0.45));
}

.particle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 170%;
  height: 230%;
  transform: translate(-50%, -10%);
  background: radial-gradient(circle, rgba(108, 253, 228, 0.35), transparent 70%);
  filter: blur(14px);
  opacity: 0.8;
}

.particle-1 {
  left: 46%;
  top: 28%;
  --size: 8px;
  --drift-x: 32px;
  --drift-y: -60px;
  --duration: 5.6s;
  --delay: 0s;
  --scale-start: 0.7;
  --scale-end: 1.3;
}

.particle-2 {
  left: 53%;
  top: 40%;
  --size: 6px;
  --drift-x: 18px;
  --drift-y: -45px;
  --duration: 4.8s;
  --delay: 1.1s;
  --scale-start: 0.65;
  --scale-end: 1.1;
}

.particle-3 {
  left: 50%;
  top: 56%;
  --size: 7px;
  --drift-x: -16px;
  --drift-y: -38px;
  --duration: 5.4s;
  --delay: 0.6s;
  --scale-start: 0.8;
  --scale-end: 1.2;
}

.particle-4 {
  left: 56%;
  top: 72%;
  --size: 5px;
  --drift-x: -20px;
  --drift-y: -34px;
  --duration: 4.6s;
  --delay: 1.8s;
}

.particle-5 {
  left: 59%;
  top: 24%;
  --size: 10px;
  --drift-x: -28px;
  --drift-y: -55px;
  --duration: 6.2s;
  --delay: 0.4s;
  --scale-start: 0.75;
  --scale-end: 1.35;
}

.particle-6 {
  left: 48%;
  top: 82%;
  --size: 6px;
  --drift-x: 24px;
  --drift-y: -42px;
  --duration: 6s;
  --delay: 2.1s;
  --scale-start: 0.7;
  --scale-end: 1.15;
}

@keyframes particleFloat {
  0% {
    transform: translate3d(0, 0, 0) scale(var(--scale-start, 0.85));
    opacity: 0;
  }
  30% {
    opacity: 0.5;
  }
  50% {
    transform: translate3d(var(--drift-x, 20px), var(--drift-y, -40px), 0) scale(var(--scale-end, 1.2));
    opacity: 1;
  }
  80% {
    opacity: 0.4;
  }
  100% {
    transform: translate3d(0, 0, 0) scale(var(--scale-start, 0.85));
    opacity: 0;
  }
}

/* 光晕效果 */
.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.15;
  animation: glowPulse 4s ease-in-out infinite;
}

.glow-1 {
  width: 300px;
  height: 300px;
  background: var(--holo-primary);
  left: 40%;
  top: 20%;
  animation-delay: 0s;
}

.glow-2 {
  width: 250px;
  height: 250px;
  background: var(--holo-secondary);
  left: 50%;
  top: 60%;
  animation-delay: 2s;
}


@keyframes glowPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.2;
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .spline-background {
    width: 50%;
  }
  
  .form-wrapper {
    margin-left: 52%;
  }
  
}

@media (max-width: 768px) {
  .spline-background {
    width: 100%;
    opacity: 0.3;
  }
  
  .form-wrapper {
    margin-left: auto;
    margin-right: auto;
    padding: 16px;
  }
  
  .deco-elements {
    display: none;
  }
  
  .brand-logo {
    top: 20px;
    left: 20px;
  }
  
  .logo-icon {
    width: 40px;
    height: 40px;
  }
  
  .logo-icon i {
    font-size: 20px;
  }
  
  .logo-title {
    font-size: 16px;
  }
  
  .logo-subtitle {
    font-size: 9px;
  }
  
  .form-wrapper {
    max-width: 100%;
    padding: 0 16px 16px;
  }
  
  .register-card {
    padding: 28px 24px;
  }
  
  .card-title {
    font-size: 26px;
  }
}

@media (max-width: 480px) {
  .brand-logo {
    gap: 10px;
  }
  
  .register-card {
    padding: 24px 20px;
  }
  
  .card-title {
    font-size: 24px;
  }
}
</style>

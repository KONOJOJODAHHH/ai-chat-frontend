<template>
  <div class="register-container">
    <div class="register-left">
      <div class="brand-section">
        <div class="brand-logo">
          <i class="fa-solid fa-cube"></i>
        </div>
        <h1 class="brand-title">MATRIX OS</h1>
        <p class="brand-subtitle">开启您的AI对话之旅</p>
        
        <div class="benefit-list">
          <div class="benefit-item">
            <div class="benefit-icon">
              <i class="fa-solid fa-rocket"></i>
            </div>
            <div class="benefit-content">
              <h3>即刻开始</h3>
              <p>注册即可使用强大的AI助手</p>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">
              <i class="fa-solid fa-infinity"></i>
            </div>
            <div class="benefit-content">
              <h3>无限可能</h3>
              <p>多种AI模型随意切换</p>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">
              <i class="fa-solid fa-crown"></i>
            </div>
            <div class="benefit-content">
              <h3>专属体验</h3>
              <p>个性化的智能对话服务</p>
            </div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">10K+</div>
            <div class="stat-label">活跃用户</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">99.9%</div>
            <div class="stat-label">运行时间</div>
          </div>
        </div>
      </div>
    </div>

    <div class="register-right">
      <div class="register-card glass-card">
        <div class="card-header">
          <h2>创建账号</h2>
          <p>加入我们，体验未来科技</p>
        </div>

        <form @submit.prevent="onSubmit" class="register-form">
          <div class="form-group">
            <label class="form-label">
              <i class="fa-solid fa-user"></i>
              <span>用户名</span>
            </label>
            <div class="input-wrapper">
              <input 
                v-model="form.username" 
                type="text" 
                placeholder="请输入用户名（2-20个字符）"
                class="form-input"
                autocomplete="username"
              />
              <div class="input-border"></div>
            </div>
            <span v-if="errors.username" class="error-text">{{ errors.username }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="fa-solid fa-lock"></i>
              <span>密码</span>
            </label>
            <div class="input-wrapper">
              <input 
                v-model="form.password" 
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码（至少6位）"
                class="form-input"
                autocomplete="new-password"
              />
              <button 
                type="button" 
                class="password-toggle" 
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
              </button>
              <div class="input-border"></div>
            </div>
            <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
            <div v-else class="password-strength">
              <div class="strength-bar">
                <div class="strength-fill" :class="passwordStrength.level" :style="{ width: passwordStrength.percent }"></div>
              </div>
              <span class="strength-text">{{ passwordStrength.text }}</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="fa-solid fa-check-double"></i>
              <span>确认密码</span>
            </label>
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
              >
                <i :class="showConfirm ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
              </button>
              <div class="input-border"></div>
            </div>
            <span v-if="errors.confirm" class="error-text">{{ errors.confirm }}</span>
          </div>

          <button 
            type="submit" 
            class="submit-button" 
            :disabled="!canSubmit || loading"
            :class="{ loading }"
          >
            <span v-if="!loading" class="button-content">
              <i class="fa-solid fa-user-plus"></i>
              <span>立即注册</span>
            </span>
            <span v-else class="button-loading">
              <i class="fa-solid fa-spinner fa-spin"></i>
              <span>注册中...</span>
            </span>
          </button>

          <div class="form-footer">
            <span class="footer-text">已有账号？</span>
            <router-link to="/login" class="text-link">立即登录</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { authAPI } from '@/utils/api'

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
    errors.value.username = '用户名最多20个字符'
    return false
  }
  if (form.value.password.length < 6) {
    errors.value.password = '密码至少6位'
    return false
  }
  if (form.value.password.length > 50) {
    errors.value.password = '密码最多50位'
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
  display: flex;
  min-height: 100vh;
  background: var(--bg-color);
  position: relative;
  overflow: hidden;
}

/* 左侧品牌区 */
.register-left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  position: relative;
  background: linear-gradient(135deg, rgba(168, 199, 250, 0.03) 0%, transparent 100%);
}

.register-left::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 30% 40%, rgba(168, 199, 250, 0.12), transparent 50%),
    radial-gradient(circle at 70% 60%, rgba(99, 102, 241, 0.08), transparent 50%);
  animation: pulse 10s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.brand-section {
  max-width: 520px;
  position: relative;
  z-index: 1;
}

.brand-logo {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover));
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
  box-shadow: 0 16px 48px rgba(168, 199, 250, 0.3);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(2deg); }
}

.brand-logo i {
  font-size: 50px;
  color: #0a0a0a;
}

.brand-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 52px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 12px 0;
  letter-spacing: 2px;
}

.brand-subtitle {
  font-size: 17px;
  color: var(--text-secondary);
  margin: 0 0 48px 0;
  letter-spacing: 0.5px;
}

.benefit-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 48px;
}

.benefit-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  transition: all 0.3s;
}

.benefit-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--accent-primary);
  transform: translateX(8px);
}

.benefit-icon {
  width: 48px;
  height: 48px;
  background: rgba(168, 199, 250, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.benefit-icon i {
  font-size: 22px;
  color: var(--accent-primary);
}

.benefit-content h3 {
  font-size: 17px;
  color: var(--text-primary);
  margin: 0 0 6px 0;
  font-weight: 600;
}

.benefit-content p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.stat-item {
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
}

/* 右侧注册区 */
.register-right {
  flex: 0 0 550px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px);
}

.register-card {
  width: 100%;
  max-width: 460px;
  padding: 48px 40px;
  border-radius: 24px;
  animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.card-header {
  margin-bottom: 32px;
}

.card-header h2 {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.card-header p {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0;
}

/* 表单样式 */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.form-label i {
  font-size: 16px;
  color: var(--accent-primary);
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 15px;
  transition: all 0.2s;
  outline: none;
}

.form-input:hover {
  border-color: rgba(168, 199, 250, 0.3);
}

.form-input:focus {
  background: rgba(0, 0, 0, 0.4);
  border-color: var(--accent-primary);
}

.form-input::placeholder {
  color: var(--text-muted);
  font-size: 14px;
}

.input-border {
  display: none;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px;
  transition: color 0.2s;
  z-index: 2;
}

.password-toggle:hover {
  color: var(--accent-primary);
}

.error-text {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

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
  transition: width 0.3s, background 0.3s;
  border-radius: 2px;
}

.strength-fill.weak {
  background: #ef4444;
}

.strength-fill.medium {
  background: #eab308;
}

.strength-fill.strong {
  background: #22c55e;
}

.strength-text {
  font-size: 12px;
  font-weight: 600;
  min-width: 24px;
}

.strength-fill.weak ~ .strength-text {
  color: #ef4444;
}

.password-strength:has(.strength-fill.medium) .strength-text {
  color: #eab308;
}

.password-strength:has(.strength-fill.strong) .strength-text {
  color: #22c55e;
}

.submit-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover));
  border: none;
  border-radius: 12px;
  color: #0a0a0a;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 8px;
  position: relative;
  overflow: hidden;
}

.submit-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.submit-button:hover:not(:disabled)::before {
  left: 100%;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(168, 199, 250, 0.4);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-content,
.button-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.form-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--glass-border);
  margin-top: 8px;
}

.footer-text {
  font-size: 14px;
  color: var(--text-secondary);
  margin-right: 8px;
}

.text-link {
  font-size: 14px;
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 600;
  position: relative;
  transition: color 0.2s;
}

.text-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--accent-primary);
  transition: width 0.3s;
}

.text-link:hover {
  color: var(--accent-hover);
}

.text-link:hover::after {
  width: 100%;
}

/* 响应式 */
@media (max-width: 1024px) {
  .register-left {
    display: none;
  }
  
  .register-right {
    flex: 1;
  }
}

@media (max-width: 640px) {
  .register-right {
    padding: 20px;
  }
  
  .register-card {
    padding: 32px 24px;
  }
}
</style>

<style scoped>
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: var(--bg-color);
  position: relative;
  overflow: hidden;
}

.auth-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 50%, rgba(168, 199, 250, 0.08), transparent 50%),
              radial-gradient(circle at 70% 50%, rgba(99, 102, 241, 0.06), transparent 50%);
  animation: bgFloat 20s ease-in-out infinite;
  pointer-events: none;
}

@keyframes bgFloat {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(-30px, -30px) rotate(5deg); }
}

.auth-card {
  width: 460px;
  max-width: 100%;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border-radius: 24px;
  position: relative;
  z-index: 1;
  animation: cardFloat 0.6s ease-out;
}

@keyframes cardFloat {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  font-family: 'Orbitron', sans-serif;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text-primary);
  margin-bottom: 36px;
  position: relative;
}

.logo-icon {
  color: var(--accent-primary);
  font-size: 32px;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px rgba(168, 199, 250, 0.3)); }
  50% { transform: scale(1.05); filter: drop-shadow(0 0 16px rgba(168, 199, 250, 0.5)); }
}

.logo-text {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(168, 199, 250, 0.3);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-header h2 {
  margin: 0 0 10px 0;
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.auth-header p {
  margin: 0;
  font-size: 15px;
  color: var(--text-secondary);
  font-weight: 400;
}

.submit-btn {
  width: 100%;
  margin-top: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  height: 48px;
  font-size: 15px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover));
  border: none;
  transition: all 0.3s var(--ease-out);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(168, 199, 250, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 20px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--glass-border);
}

.link {
  color: var(--accent-primary);
  font-size: 13px;
  text-decoration: none;
  transition: all 0.2s;
  font-weight: 500;
  position: relative;
  display: inline-block;
}

.link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--accent-primary);
  transition: width 0.3s var(--ease-out);
}

.link:hover {
  color: var(--accent-hover);
}

.link:hover::after {
  width: 100%;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-form-item__label) {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
}

:deep(.el-form-item__error) {
  color: #ef4444;
  font-size: 12px;
  margin-top: 6px;
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid var(--glass-border);
  box-shadow: none;
  transition: all 0.3s var(--ease-out);
  border-radius: 12px;
  padding: 12px 16px;
}

:deep(.el-input__wrapper:hover) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(168, 199, 250, 0.4);
}

:deep(.el-input__wrapper.is-focus) {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(168, 199, 250, 0.15);
}

:deep(.el-input__inner) {
  color: var(--text-primary);
  font-size: 15px;
}

:deep(.el-input__inner::placeholder) {
  color: var(--text-muted);
}

:deep(.el-input__suffix) {
  color: var(--text-muted);
}
</style>
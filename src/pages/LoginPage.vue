<template>
  <div class="login-container">
    <div class="login-left">
      <div class="brand-section">
        <div class="brand-logo">
          <i class="fa-solid fa-cube"></i>
        </div>
        <h1 class="brand-title">MATRIX OS</h1>
        <p class="brand-subtitle">Next Generation AI Chat Platform</p>
        
        <div class="feature-list">
          <div class="feature-item">
            <i class="fa-solid fa-bolt"></i>
            <span>多模型支持</span>
          </div>
          <div class="feature-item">
            <i class="fa-solid fa-shield-halved"></i>
            <span>安全可靠</span>
          </div>
          <div class="feature-item">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            <span>智能提示</span>
          </div>
        </div>

        <div class="cyber-decoration">
          <div class="cyber-line"></div>
          <div class="cyber-line"></div>
          <div class="cyber-line"></div>
        </div>
      </div>
    </div>

    <div class="login-right">
      <div class="login-card glass-card">
        <div class="card-header">
          <h2>欢迎回来</h2>
          <p>登录您的账号以继续</p>
        </div>

        <form @submit.prevent="onSubmit" class="login-form">
          <div class="form-group">
            <label class="form-label">
              <i class="fa-solid fa-user"></i>
              <span>用户名</span>
            </label>
            <div class="input-wrapper">
              <input 
                v-model="form.username" 
                type="text" 
                placeholder="请输入用户名"
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
                placeholder="请输入密码"
                class="form-input"
                autocomplete="current-password"
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
          </div>

          <div class="form-options">
            <label class="checkbox-wrapper">
              <input type="checkbox" v-model="form.remember" />
              <span class="checkbox-custom"></span>
              <span class="checkbox-label">记住我</span>
            </label>
            <router-link to="/register" class="text-link">
              没有账号？立即注册
            </router-link>
          </div>

          <button 
            type="submit" 
            class="submit-button" 
            :disabled="!canSubmit || loading"
            :class="{ loading }"
          >
            <span v-if="!loading" class="button-content">
              <i class="fa-solid fa-arrow-right"></i>
              <span>登录</span>
            </span>
            <span v-else class="button-loading">
              <i class="fa-solid fa-spinner fa-spin"></i>
              <span>登录中...</span>
            </span>
          </button>
        </form>

        <div class="quick-login">
          <div class="divider">
            <span>快捷登录</span>
          </div>
          <div class="quick-buttons">
            <button class="quick-btn" title="管理员快捷登录" @click="quickLogin('admin')">
              <i class="fa-solid fa-shield-halved"></i>
              <span>管理员</span>
            </button>
            <button class="quick-btn" title="普通用户快捷登录" @click="quickLogin('user')">
              <i class="fa-solid fa-user"></i>
              <span>用户</span>
            </button>
          </div>
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
import { useAuthStore } from '@/composables/useAuthStore'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const showPassword = ref(false)
const form = ref({ username: '', password: '', remember: true })
const errors = ref<Record<string, string>>({})

const canSubmit = computed(() => 
  form.value.username.trim().length >= 2 && form.value.password.length >= 6
)

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
  
  return true
}

const onSubmit = async () => {
  if (!validate()) return
  
  try {
    loading.value = true
    const res = await authAPI.login({ 
      username: form.value.username.trim(), 
      password: form.value.password 
    })
    
    if ('token' in res && 'user' in res) {
      auth.setToken(res.token, form.value.remember)
      auth.setUser(res.user)
      localStorage.setItem('lastUsername', res.user.username)
      
      ElMessage.success({
        message: `欢迎回来，${res.user.username}！`,
        duration: 2000,
      })
      
      const targetRoute = res.user.role === 'admin' ? '/admin' : '/'
      setTimeout(() => router.replace(targetRoute), 500)
    }
  } catch (e) {
    ElMessage.error('登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

const quickLogin = async (type: 'admin' | 'user') => {
  form.value.username = type === 'admin' ? 'admin' : 'user'
  form.value.password = '123456'
  await onSubmit()
}
</script>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  background: var(--bg-color);
  position: relative;
  overflow: hidden;
}

/* 左侧品牌区 */
.login-left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  position: relative;
  background: linear-gradient(135deg, rgba(168, 199, 250, 0.03) 0%, transparent 100%);
}

.login-left::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(168, 199, 250, 0.1), transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.08), transparent 40%);
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.brand-section {
  max-width: 500px;
  position: relative;
  z-index: 1;
}

.brand-logo {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover));
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  box-shadow: 0 20px 60px rgba(168, 199, 250, 0.3);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.brand-logo i {
  font-size: 60px;
  color: #0a0a0a;
}

.brand-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 56px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 16px 0;
  letter-spacing: 2px;
}

.brand-subtitle {
  font-size: 18px;
  color: var(--text-secondary);
  margin: 0 0 48px 0;
  letter-spacing: 1px;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 48px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  transition: all 0.3s;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--accent-primary);
  transform: translateX(8px);
}

.feature-item i {
  font-size: 24px;
  color: var(--accent-primary);
}

.feature-item span {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
}

.cyber-decoration {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 48px;
}

.cyber-line {
  height: 2px;
  background: linear-gradient(90deg, var(--accent-primary), transparent);
  border-radius: 2px;
  animation: scan 3s ease-in-out infinite;
}

.cyber-line:nth-child(2) {
  width: 70%;
  animation-delay: 0.5s;
}

.cyber-line:nth-child(3) {
  width: 40%;
  animation-delay: 1s;
}

@keyframes scan {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* 右侧登录区 */
.login-right {
  flex: 0 0 550px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px);
}

.login-card {
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
  margin-bottom: 36px;
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
.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
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
}

.password-toggle:hover {
  color: var(--accent-primary);
}

.error-text {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.checkbox-wrapper input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid var(--glass-border);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  position: relative;
  transition: all 0.3s;
}

.checkbox-wrapper:hover .checkbox-custom {
  border-color: var(--accent-primary);
}

.checkbox-wrapper input:checked ~ .checkbox-custom {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
}

.checkbox-wrapper input:checked ~ .checkbox-custom::after {
  content: '\f00c';
  font-family: 'Font Awesome 6 Free';
  font-weight: 900;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #0a0a0a;
  font-size: 12px;
}

.checkbox-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.text-link {
  font-size: 14px;
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 500;
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

.quick-login {
  margin-top: 32px;
}

.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--glass-border);
}

.divider span {
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
}

.quick-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.quick-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-primary);
  color: var(--text-primary);
}

.quick-btn i {
  font-size: 16px;
}

/* 响应式 */
@media (max-width: 1024px) {
  .login-left {
    display: none;
  }
  
  .login-right {
    flex: 1;
  }
}

@media (max-width: 640px) {
  .login-right {
    padding: 20px;
  }
  
  .login-card {
    padding: 32px 24px;
  }
  
  .brand-title {
    font-size: 40px;
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

.auth-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -4px 0 24px;
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

.link {
  color: var(--accent-primary);
  font-size: 13px;
  text-decoration: none;
  transition: all 0.2s;
  font-weight: 500;
  position: relative;
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
  margin-bottom: 24px;
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

:deep(.el-checkbox) {
  height: auto;
}

:deep(.el-checkbox__label) {
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
}

:deep(.el-checkbox__inner) {
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid var(--glass-border);
  border-radius: 4px;
  width: 16px;
  height: 16px;
  transition: all 0.2s;
}

:deep(.el-checkbox__inner:hover) {
  border-color: var(--accent-primary);
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
}

:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: var(--text-primary);
}
</style>
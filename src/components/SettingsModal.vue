<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div class="modal-overlay" v-if="modelValue" @click.self="closeModal">
        <div class="holo-modal settings-modal">
          <div class="modal-header">
            <h2>系统设置</h2>
            <button class="close-btn" @click="closeModal">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="modal-sidebar">
              <div 
                class="tab-item" 
                :class="{ active: currentTab === 'general' }"
                @click="currentTab = 'general'"
              >
                <i class="fa-solid fa-sliders"></i>
                <span>通用设置</span>
              </div>
              <div 
                class="tab-item" 
                :class="{ active: currentTab === 'stats' }"
                @click="currentTab = 'stats'"
              >
                <i class="fa-solid fa-chart-line"></i>
                <span>数据统计</span>
              </div>
              <div 
                class="tab-item" 
                :class="{ active: currentTab === 'account' }"
                @click="currentTab = 'account'"
              >
                <i class="fa-solid fa-user-gear"></i>
                <span>账号管理</span>
              </div>
            </div>

            <div class="modal-content-area">
              <!-- 通用设置 -->
              <div v-if="currentTab === 'general'" class="settings-section">
                <h3>主题配色</h3>
                <div class="setting-item">
                  <div class="setting-label">
                    <i class="fa-solid fa-moon"></i>
                    <span>切换主题</span>
                  </div>
                  <div class="theme-toggle">
                    <button class="theme-btn active">
                      <i class="fa-solid fa-moon"></i>
                      <span>夜间</span>
                    </button>
                    <button class="theme-btn" disabled>
                      <i class="fa-solid fa-sun"></i>
                      <span>日间</span>
                    </button>
                  </div>
                </div>
                <p class="setting-note">
                  <i class="fa-solid fa-circle-info"></i>
                  日间模式暂未实现
                </p>
              </div>

              <!-- 数据统计 -->
              <div v-if="currentTab === 'stats'" class="settings-section">
                <h3>使用统计</h3>
                <div class="stats-grid">
                  <div class="stat-card">
                    <i class="fa-solid fa-comments stat-icon"></i>
                    <div class="stat-value">{{ stats.totalConversations }}</div>
                    <div class="stat-label">总对话数</div>
                  </div>
                  <div class="stat-card">
                    <i class="fa-solid fa-message stat-icon"></i>
                    <div class="stat-value">{{ stats.totalMessages }}</div>
                    <div class="stat-label">总消息数</div>
                  </div>
                  <div class="stat-card">
                    <i class="fa-solid fa-clock stat-icon"></i>
                    <div class="stat-value">{{ stats.totalTime }}</div>
                    <div class="stat-label">使用时长</div>
                  </div>
                  <div class="stat-card">
                    <i class="fa-solid fa-fire stat-icon"></i>
                    <div class="stat-value">{{ stats.streak }}</div>
                    <div class="stat-label">连续使用</div>
                  </div>
                </div>
              </div>

              <!-- 账号管理 -->
              <div v-if="currentTab === 'account'" class="settings-section">
                <h3>个人资料</h3>
                <div class="profile-form">
                  <div class="form-group">
                    <label>用户名</label>
                    <el-input 
                      v-model="formData.username" 
                      disabled
                      placeholder="用户名"
                    />
                  </div>

                  <div class="form-group">
                    <label>昵称</label>
                    <el-input 
                      v-model="formData.nickname" 
                      placeholder="设置昵称"
                    />
                  </div>

                  <button class="submit-btn" @click="updateProfile">
                    <i class="fa-solid fa-check"></i>
                    保存资料
                  </button>
                </div>

                <div class="divider"></div>

                <h3>修改密码</h3>
                <div class="profile-form">
                  <div class="form-group">
                    <label>原密码</label>
                    <el-input 
                      v-model="formData.oldPassword" 
                      type="password"
                      placeholder="请输入原密码"
                      show-password
                    />
                  </div>

                  <div class="form-group">
                    <label>新密码</label>
                    <el-input 
                      v-model="formData.newPassword" 
                      type="password"
                      placeholder="请输入新密码"
                      show-password
                    />
                  </div>

                  <div class="form-group">
                    <label>确认密码</label>
                    <el-input 
                      v-model="formData.confirmPassword" 
                      type="password"
                      placeholder="再次输入新密码"
                      show-password
                    />
                  </div>

                  <button class="submit-btn" @click="changePassword">
                    <i class="fa-solid fa-key"></i>
                    修改密码
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/composables/useAuthStore'
import { useChatStore } from '@/composables/useChatStore'
import { updateUserProfile, changeUserPassword } from '@/utils/mockApi'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const auth = useAuthStore()
const chat = useChatStore()
const currentTab = ref('general')

const formData = reactive({
  username: '',
  nickname: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const stats = computed(() => ({
  totalConversations: chat.conversations.value.length,
  totalMessages: chat.conversations.value.reduce((sum, conv) => sum + conv.messages.length, 0),
  totalTime: '42小时',
  streak: '7天'
}))

watch(() => props.modelValue, (newVal) => {
  if (newVal && auth.user) {
    formData.username = auth.user.username
    formData.nickname = auth.user.nickname || ''
  }
})

const closeModal = () => {
  emit('update:modelValue', false)
}

const updateProfile = async () => {
  if (!formData.nickname.trim()) {
    ElMessage.warning('请输入昵称')
    return
  }

  try {
    await updateUserProfile({ nickname: formData.nickname })
    if (auth.user) {
      auth.user.nickname = formData.nickname
    }
    ElMessage.success('资料更新成功')
  } catch (error: any) {
    ElMessage.error(error.message || '更新失败')
  }
}

const changePassword = async () => {
  if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
    ElMessage.warning('请填写完整信息')
    return
  }

  if (formData.newPassword !== formData.confirmPassword) {
    ElMessage.warning('两次密码输入不一致')
    return
  }

  if (formData.newPassword.length < 6) {
    ElMessage.warning('新密码长度至少6位')
    return
  }

  try {
    await changeUserPassword({
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword
    })
    ElMessage.success('密码修改成功')
    formData.oldPassword = ''
    formData.newPassword = ''
    formData.confirmPassword = ''
  } catch (error: any) {
    ElMessage.error(error.message || '修改失败')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .holo-modal,
.modal-fade-leave-active .holo-modal {
  transition: transform 0.3s var(--ease-out);
}

.modal-fade-enter-from .holo-modal,
.modal-fade-leave-to .holo-modal {
  transform: scale(0.9) translateY(20px);
}

.holo-modal {
  background: rgba(23, 23, 23, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 900px;
  height: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.settings-modal .modal-header {
  padding: 24px 30px;
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: 'Orbitron', sans-serif;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.modal-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.modal-sidebar {
  width: 220px;
  padding: 20px;
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tab-item {
  padding: 12px 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
  font-size: 14px;
}

.tab-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.tab-item.active {
  background: rgba(168, 199, 250, 0.1);
  color: var(--accent-primary);
  font-weight: 500;
}

.tab-item i {
  width: 18px;
  text-align: center;
  font-size: 16px;
}

.modal-content-area {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.settings-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: 'Orbitron', sans-serif;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  margin-bottom: 16px;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
  font-size: 14px;
}

.setting-label i {
  color: var(--accent-primary);
}

.theme-toggle {
  display: flex;
  gap: 8px;
}

.theme-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.theme-btn:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-primary);
}

.theme-btn.active {
  background: rgba(168, 199, 250, 0.1);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.theme-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.setting-note {
  font-size: 13px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.2s;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 28px;
  color: var(--accent-primary);
  margin-bottom: 12px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
  font-family: 'Orbitron', sans-serif;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.submit-btn {
  padding: 12px 24px;
  background: rgba(168, 199, 250, 0.1);
  border: 1px solid var(--accent-primary);
  color: var(--accent-primary);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.submit-btn:hover {
  background: rgba(168, 199, 250, 0.15);
}

.divider {
  height: 1px;
  background: var(--glass-border);
  margin: 30px 0;
}

:deep(.el-input__wrapper) {
  background: rgba(0, 0, 0, 0.4) !important;
  box-shadow: none !important;
  border: 1px solid var(--glass-border);
  transition: border-color 0.2s;
}

:deep(.el-input__wrapper:hover) {
  border-color: rgba(168, 199, 250, 0.4);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent-primary) !important;
}

:deep(.el-input__inner) {
  color: var(--text-primary);
}

:deep(.el-input__inner::placeholder) {
  color: var(--text-muted);
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.03) !important;
}

@media (max-width: 768px) {
  .modal-body {
    flex-direction: column;
  }

  .modal-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--glass-border);
    flex-direction: row;
    overflow-x: auto;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>

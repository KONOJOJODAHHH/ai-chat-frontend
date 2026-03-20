<template>
  <section class="settings-page">
    <h2 class="page-title">账号管理</h2>

    <!-- 个人资料 -->
    <div class="settings-section">
      <div class="section-header">
        <h3>个人资料</h3>
      </div>

      <div class="setting-row">
        <div class="setting-label-wrap">
          <span class="setting-label">用户名</span>
          <span class="setting-desc">登录账号，不可修改</span>
        </div>
        <input
          class="row-input"
          :value="auth.user.value?.username || ''"
          disabled
        />
      </div>

      <div class="setting-row">
        <div class="setting-label-wrap">
          <span class="setting-label">昵称</span>
          <span class="setting-desc">显示在界面上的名称</span>
        </div>
        <input
          class="row-input"
          v-model="profileForm.nickname"
          placeholder="设置昵称"
        />
      </div>

      <div class="section-footer">
        <button class="primary-btn" :disabled="profileSaving" @click="updateProfile">
          <i class="fa-solid fa-check"></i>
          <span>{{ profileSaving ? '保存中...' : '保存资料' }}</span>
        </button>
      </div>
    </div>

    <!-- 修改密码 -->
    <div class="settings-section">
      <div class="section-header">
        <h3>安全</h3>
      </div>

      <div class="setting-row">
        <div class="setting-label-wrap">
          <span class="setting-label">原密码</span>
        </div>
        <input
          class="row-input"
          v-model="passwordForm.oldPassword"
          type="password"
          placeholder="请输入原密码"
        />
      </div>

      <div class="setting-row">
        <div class="setting-label-wrap">
          <span class="setting-label">新密码</span>
          <span class="setting-desc">至少 6 位</span>
        </div>
        <input
          class="row-input"
          v-model="passwordForm.newPassword"
          type="password"
          placeholder="请输入新密码"
        />
      </div>

      <div class="setting-row">
        <div class="setting-label-wrap">
          <span class="setting-label">确认密码</span>
        </div>
        <input
          class="row-input"
          v-model="passwordForm.confirmPassword"
          type="password"
          placeholder="再次输入新密码"
        />
      </div>

      <div class="section-footer">
        <button class="primary-btn" :disabled="passwordSaving" @click="changePassword">
          <i class="fa-solid fa-key"></i>
          <span>{{ passwordSaving ? '提交中...' : '修改密码' }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/composables/useAuthStore'
import { authAPI } from '@/utils/api'

const auth = useAuthStore()

const profileForm = reactive({ nickname: auth.user.value?.nickname || '' })
const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

const profileSaving = ref(false)
const passwordSaving = ref(false)

watch(() => auth.user.value, (nextUser) => {
  profileForm.nickname = nextUser?.nickname || ''
}, { immediate: true })

const updateProfile = async () => {
  if (!profileForm.nickname.trim()) {
    ElMessage.warning('请输入昵称')
    return
  }
  try {
    profileSaving.value = true
    await authAPI.updateProfile({ nickname: profileForm.nickname.trim() })
    if (auth.user.value) {
      auth.setUser({ ...auth.user.value, nickname: profileForm.nickname.trim() })
    }
    ElMessage.success('资料更新成功')
  } catch (error: any) {
    ElMessage.error(error?.message || '更新失败')
  } finally {
    profileSaving.value = false
  }
}

const changePassword = async () => {
  if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    ElMessage.warning('请填写完整信息')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.warning('两次密码输入不一致')
    return
  }
  if (passwordForm.newPassword.length < 6) {
    ElMessage.warning('新密码长度至少 6 位')
    return
  }
  try {
    passwordSaving.value = true
    await authAPI.changePassword({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword })
    ElMessage.success('密码修改成功')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error: any) {
    ElMessage.error(error?.message || '修改失败')
  } finally {
    passwordSaving.value = false
  }
}
</script>

<style scoped>
.settings-page {
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 100%;
  box-sizing: border-box;
}

.page-title {
  margin: 0 0 4px;
  font-size: var(--page-title-size);
  font-weight: var(--page-title-weight);
}

.settings-section {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  overflow: hidden;
}

.section-header {
  padding: 18px 24px 0;
}

.section-header h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.setting-row:first-of-type {
  margin-top: 12px;
}

.setting-label-wrap {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 120px;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.setting-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.row-input {
  flex: 1;
  max-width: 320px;
  height: 38px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.3);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.row-input:focus {
  border-color: rgba(168, 199, 250, 0.4);
}

.row-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.section-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: flex-end;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid rgba(168, 199, 250, 0.25);
  background: rgba(168, 199, 250, 0.12);
  color: var(--accent-primary);
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  font-weight: 500;
  transition: all 0.18s ease;
}

.primary-btn:hover:not(:disabled) {
  background: rgba(168, 199, 250, 0.2);
}

.primary-btn:disabled {
  opacity: 0.55;
  cursor: wait;
}

@media (max-width: 900px) {
  .settings-page { padding: 20px 16px; }
  .setting-row { flex-direction: column; align-items: flex-start; gap: 10px; }
  .row-input { max-width: 100%; width: 100%; }
}
</style>

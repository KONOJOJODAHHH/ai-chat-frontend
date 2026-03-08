<template>
  <section class="settings-page glass-card">
    <header class="page-header">
      <div>
        <p class="eyebrow">ACCOUNT</p>
        <h2>账号管理</h2>
        <p>原设置弹窗里的资料维护和密码修改已经迁入页面化设置中心，功能保持可用。</p>
      </div>
    </header>

    <div class="account-grid">
      <article class="account-panel">
        <div class="panel-header">
          <h3>个人资料</h3>
          <span>直接调用现有账号接口</span>
        </div>

        <div class="form-group">
          <label>用户名</label>
          <input class="form-input readonly" :value="auth.user.value?.username || ''" disabled />
        </div>

        <div class="form-group">
          <label>昵称</label>
          <input class="form-input" v-model="profileForm.nickname" placeholder="设置昵称" />
        </div>

        <button class="primary-btn" :disabled="profileSaving" @click="updateProfile">
          <i class="fa-solid fa-check"></i>
          <span>{{ profileSaving ? '保存中...' : '保存资料' }}</span>
        </button>
      </article>

      <article class="account-panel">
        <div class="panel-header">
          <h3>修改密码</h3>
          <span>沿用现有密码校验逻辑</span>
        </div>

        <div class="form-group">
          <label>原密码</label>
          <input class="form-input" v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" />
        </div>

        <div class="form-group">
          <label>新密码</label>
          <input class="form-input" v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" />
        </div>

        <div class="form-group">
          <label>确认密码</label>
          <input class="form-input" v-model="passwordForm.confirmPassword" type="password" placeholder="再次输入新密码" />
        </div>

        <button class="primary-btn" :disabled="passwordSaving" @click="changePassword">
          <i class="fa-solid fa-key"></i>
          <span>{{ passwordSaving ? '提交中...' : '修改密码' }}</span>
        </button>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/composables/useAuthStore'
import { authAPI } from '@/utils/api'

const auth = useAuthStore()

const profileForm = reactive({
  nickname: auth.user.value?.nickname || '',
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

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
      auth.setUser({
        ...auth.user.value,
        nickname: profileForm.nickname.trim(),
      })
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
    await authAPI.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    })
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
.settings-page { min-height: calc(100vh - 40px); padding: 32px; }
.page-header { margin-bottom: 28px; }
.eyebrow { margin: 0 0 10px; font-size: 11px; letter-spacing: 0.24em; color: var(--text-secondary); }
h2 { margin: 0 0 12px; font-size: 30px; }
.page-header p { margin: 0; color: var(--text-secondary); line-height: 1.7; }
.account-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.account-panel { padding: 24px; border-radius: 20px; background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); display: flex; flex-direction: column; gap: 16px; }
.panel-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 4px; }
.panel-header h3 { margin: 0; }
.panel-header span { font-size: 12px; color: var(--text-secondary); }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { color: var(--text-secondary); font-size: 14px; }
.form-input { width: 100%; min-height: 46px; padding: 0 14px; border-radius: 14px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.03); color: var(--text-primary); }
.form-input.readonly { opacity: 0.7; }
.primary-btn { min-height: 48px; border-radius: 14px; border: 1px solid rgba(168, 199, 250, 0.2); background: rgba(168, 199, 250, 0.12); color: var(--accent-primary); display: inline-flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; }
.primary-btn:disabled { opacity: 0.65; cursor: wait; }
@media (max-width: 900px) { .account-grid { grid-template-columns: 1fr; } }
</style>

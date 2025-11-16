<template>
  <aside class="conversation-sidebar glass-card">
    <div class="logo-area">
      <i class="fa-solid fa-cube logo-icon"></i>
      <span>MATRIX OS</span>
    </div>
    
    <div class="sidebar-content">
      <button class="new-chat-btn" @click="createNewConversation">
        <i class="fa-solid fa-plus"></i>
        <span>新建对话</span>
      </button>

      <div class="conversation-list">
        <div class="conversation-group">
          <div class="group-title">RECENT</div>
          <div
            v-for="conversation in conversations"
            :key="conversation.id"
            class="conversation-item"
            :class="{ active: currentConversation?.id === conversation.id }"
            @click="selectConversation(conversation)"
          >
            <i class="fa-regular fa-message"></i>
            <div class="conversation-info">
              <div class="conversation-title">{{ conversation.title }}</div>
            </div>
            <div class="conversation-actions" @click.stop>
              <i class="fa-solid fa-ellipsis action-icon" @click="toggleMenu(conversation.id)"></i>
              <div class="action-menu" v-show="activeMenu === conversation.id">
                <div class="action-item" @click="handleRename(conversation)">
                  <i class="fa-solid fa-pen"></i>
                  <span>重命名</span>
                </div>
                <div class="action-item danger" @click="handleDelete(conversation)">
                  <i class="fa-solid fa-trash"></i>
                  <span>删除</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="user-bar" @click="toggleUserMenu">
      <div class="user-avatar">
        {{ username?.charAt(0).toUpperCase() || 'U' }}
      </div>
      <span class="user-name">{{ username }}</span>
      <i class="fa-solid fa-chevron-down" style="font-size: 12px; margin-left: auto; color: var(--text-muted);"></i>
    </div>

    <div class="user-dropdown-menu" v-show="showUserMenu">
      <div class="user-menu-item" @click.stop="openSettings">
        <i class="fa-solid fa-gear"></i>
        <span>系统设置</span>
      </div>
      <div class="user-menu-divider"></div>
      <div class="user-menu-item danger" @click.stop="handleLogout">
        <i class="fa-solid fa-right-from-bracket"></i>
        <span>退出登录</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/composables/useAuthStore'
import type { Conversation } from '@/composables/useChatStore'

const props = defineProps<{
  conversations: Conversation[]
  currentConversation: Conversation | null
}>()

const emit = defineEmits<{
  select: [conversation: Conversation]
  create: []
  delete: [id: string]
  rename: [id: string, title: string]
  openSettings: []
}>()

const auth = useAuthStore()
const activeMenu = ref<string | null>(null)
const showUserMenu = ref(false)

const username = computed(() => auth.user?.username || '用户')

const createNewConversation = () => {
  emit('create')
}

const selectConversation = (conversation: Conversation) => {
  emit('select', conversation)
}

const toggleMenu = (id: string) => {
  activeMenu.value = activeMenu.value === id ? null : id
}

const handleRename = (conversation: Conversation) => {
  activeMenu.value = null
  ElMessageBox.prompt('请输入新的对话标题', '重命名对话', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: conversation.title,
    inputPattern: /^.{1,50}$/,
    inputErrorMessage: '标题长度必须在1-50个字符之间'
  }).then(({ value }) => {
    emit('rename', conversation.id, value)
    ElMessage.success('重命名成功')
  }).catch(() => {})
}

const handleDelete = (conversation: Conversation) => {
  activeMenu.value = null
  ElMessageBox.confirm(
    '确定要删除这个对话吗？删除后将无法恢复。',
    '删除对话',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    emit('delete', conversation.id)
  }).catch(() => {})
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const openSettings = () => {
  showUserMenu.value = false
  emit('openSettings')
}

const handleLogout = () => {
  showUserMenu.value = false
  ElMessageBox.confirm('确定要退出登录吗？', '退出确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    auth.logout()
    ElMessage.success('已注销')
    window.location.href = '/login'
  }).catch(() => {})
}

// 点击外部关闭菜单
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement
  if (!target.closest('.conversation-actions')) {
    activeMenu.value = null
  }
  if (!target.closest('.user-bar') && !target.closest('.user-dropdown-menu')) {
    showUserMenu.value = false
  }
})
</script>

<style scoped>
.conversation-sidebar {
  width: 260px;
  display: flex;
  flex-direction: column;
  padding: 24px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s var(--ease-out);
  z-index: 10;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Orbitron', sans-serif;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--text-primary);
  margin-bottom: 30px;
}

.logo-icon {
  color: var(--accent-primary);
  font-size: 20px;
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.new-chat-btn {
  width: 100%;
  padding: 14px;
  background: rgba(168, 199, 250, 0.08);
  border: 1px solid rgba(168, 199, 250, 0.15);
  color: var(--text-primary);
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 25px;
}

.new-chat-btn:hover {
  background: rgba(168, 199, 250, 0.12);
  border-color: rgba(168, 199, 250, 0.25);
}

.new-chat-btn i {
  color: var(--accent-primary);
  font-size: 16px;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-group {
  margin-bottom: 20px;
}

.group-title {
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
  padding-left: 0;
  font-weight: 600;
}

.conversation-item {
  padding: 12px;
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
  margin-bottom: 4px;
  position: relative;
}

.conversation-item:hover {
  background: rgba(255,255,255,0.05);
  color: var(--text-primary);
}

.conversation-item.active {
  background: rgba(255,255,255,0.08);
  color: var(--text-primary);
  font-weight: 500;
}

.conversation-item i:first-child {
  font-size: 16px;
  flex-shrink: 0;
}

.conversation-info {
  flex: 1;
  overflow: hidden;
}

.conversation-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-actions {
  position: relative;
  opacity: 0;
  transition: opacity 0.2s;
}

.conversation-item:hover .conversation-actions {
  opacity: 1;
}

.action-icon {
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
  font-size: 14px;
}

.action-icon:hover {
  background: rgba(255,255,255,0.1);
}

.action-menu {
  position: absolute;
  right: 0;
  top: 30px;
  background: rgba(24, 24, 27, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 6px;
  min-width: 140px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  z-index: 100;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  color: var(--text-primary);
}

.action-item:hover {
  background: rgba(255,255,255,0.08);
}

.action-item.danger {
  color: #ef4444;
}

.action-item i {
  width: 14px;
  text-align: center;
  font-size: 12px;
}

.user-bar {
  margin-top: 20px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--glass-border);
  position: relative;
}

.user-bar:hover {
  background: rgba(255,255,255,0.06);
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #404040, #707070);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
}

.user-name {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-dropdown-menu {
  position: absolute;
  bottom: 70px;
  left: 24px;
  right: 24px;
  background: rgba(24, 24, 27, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 -10px 30px rgba(0,0,0,0.5);
  z-index: 200;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: var(--text-primary);
}

.user-menu-item:hover {
  background: rgba(255,255,255,0.08);
}

.user-menu-item.danger {
  color: #ef4444;
}

.user-menu-item i {
  width: 16px;
  text-align: center;
}

.user-menu-divider {
  height: 1px;
  background: var(--glass-border);
  margin: 6px 0;
}

@media (max-width: 768px) {
  .conversation-sidebar {
    display: none;
  }
}
</style>
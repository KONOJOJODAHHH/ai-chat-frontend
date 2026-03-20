<template>
  <!-- Main phrase panel -->
  <div class="modal-overlay" :class="{ show: modelValue }" @click.self="closeModal">
    <div class="holo-modal">
      <div class="modal-header">
        <div class="modal-title">
          <i class="fa-solid fa-bolt"></i>
          <span>快捷短语</span>
        </div>
        <i class="fa-solid fa-xmark close-modal" @click="closeModal"></i>
      </div>

      <!-- Tabs -->
      <div class="tab-bar">
        <button class="tab-btn" :class="{ active: activeTab === 'preset' }" @click="switchTab('preset')">
          <i class="fa-solid fa-star"></i> 官方短语
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'custom' }" @click="switchTab('custom')">
          <i class="fa-solid fa-user"></i> 我的短语
        </button>
      </div>

      <div class="modal-body">
        <!-- Search + New btn on same row (custom tab only shows new btn) -->
        <div class="toolbar">
          <div class="search-bar">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              :placeholder="activeTab === 'preset' ? '搜索官方短语...' : '搜索我的短语...'"
              v-model="searchQuery"
            />
          </div>
          <button v-if="activeTab === 'custom'" class="add-btn" @click="openDialog()">
            <i class="fa-solid fa-plus"></i> 新建
          </button>
        </div>

        <!-- Preset list -->
        <div v-if="activeTab === 'preset'" class="phrase-list">
          <el-tooltip
            v-for="phrase in filteredPreset"
            :key="phrase.id"
            :content="phrase.content"
            placement="right"
            effect="dark"
            popper-class="phrase-tooltip"
            :show-after="400"
            :hide-after="0"
          >
            <div class="phrase-card" @click="usePhrase(phrase.content)">
              <div class="phrase-title">{{ phrase.title }}</div>
              <div class="phrase-content">{{ phrase.content }}</div>
            </div>
          </el-tooltip>
          <div v-if="!filteredPreset.length" class="empty-state">
            <i class="fa-solid fa-inbox"></i>
            <p>暂无官方短语</p>
          </div>
        </div>

        <!-- Custom list -->
        <div v-if="activeTab === 'custom'" class="phrase-list">
          <el-tooltip
            v-for="phrase in filteredCustom"
            :key="phrase.id"
            :content="phrase.content"
            placement="right"
            effect="dark"
            popper-class="phrase-tooltip"
            :show-after="400"
            :hide-after="0"
          >
            <div class="phrase-card custom-card" @click="usePhrase(phrase.content)">
              <div class="phrase-card-header">
                <div class="phrase-title">{{ phrase.title }}</div>
                <div class="phrase-actions" @click.stop>
                  <i
                    class="fa-solid fa-pen-to-square action-icon edit-icon"
                    title="编辑"
                    @click="openDialog(phrase)"
                  ></i>
                  <i
                    class="fa-solid fa-trash action-icon delete-icon"
                    title="删除"
                    @click="deletePhrase(phrase.id)"
                  ></i>
                </div>
              </div>
              <div class="phrase-content">{{ phrase.content }}</div>
            </div>
          </el-tooltip>
          <div v-if="!filteredCustom.length" class="empty-state">
            <i class="fa-solid fa-feather"></i>
            <p>还没有自定义短语</p>
            <span>点击"新建"按钮创建</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add / Edit dialog -->
  <div class="modal-overlay" :class="{ show: dialogVisible }" @click.self="closeDialog" style="z-index: 200;">
    <div class="holo-modal edit-dialog">
      <div class="modal-header">
        <div class="modal-title">
          <i class="fa-solid fa-pen-to-square"></i>
          <span>{{ editingId ? '编辑短语' : '新建短语' }}</span>
        </div>
        <i class="fa-solid fa-xmark close-modal" @click="closeDialog"></i>
      </div>

      <div class="modal-body">
        <div class="modal-content-area">
          <div class="settings-form">
            <div class="form-group">
              <label class="form-label">标题</label>
              <input
                v-model="editForm.title"
                class="form-input"
                placeholder="例如：翻译助手、代码审查..."
                maxlength="50"
                @keydown.enter.prevent="saveDialog"
              />
            </div>
            <div class="form-group">
              <label class="form-label">内容</label>
              <textarea
                v-model="editForm.content"
                class="form-textarea"
                placeholder="输入短语内容..."
                rows="5"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="confirm-btn cancel" @click="closeDialog">取消</button>
            <button class="save-btn" @click="saveDialog" :disabled="saving">
              {{ saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { phraseAPI, type PhraseItem } from '@/utils/api'

const emit = defineEmits<{
  'update:modelValue': [boolean]
  apply: [string]
}>()

defineProps<{ modelValue: boolean }>()

const activeTab = ref<'preset' | 'custom'>('preset')
const searchQuery = ref('')
const presetPhrases = ref<PhraseItem[]>([])
const customPhrases = ref<PhraseItem[]>([])

// Dialog state
const dialogVisible = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const editForm = ref({ title: '', content: '' })

const filteredPreset = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return presetPhrases.value
  return presetPhrases.value.filter(
    p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
  )
})

const filteredCustom = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return customPhrases.value
  return customPhrases.value.filter(
    p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
  )
})

const switchTab = (tab: 'preset' | 'custom') => {
  activeTab.value = tab
  searchQuery.value = ''
}

const closeModal = () => {
  emit('update:modelValue', false)
  searchQuery.value = ''
}

const usePhrase = (content: string) => {
  emit('apply', content)
  closeModal()
}

// ------ Dialog ------
const openDialog = (phrase?: PhraseItem) => {
  if (phrase) {
    editingId.value = phrase.id
    editForm.value = { title: phrase.title, content: phrase.content }
  } else {
    editingId.value = null
    editForm.value = { title: '', content: '' }
  }
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
  editingId.value = null
  editForm.value = { title: '', content: '' }
}

const saveDialog = async () => {
  if (!editForm.value.title.trim() || !editForm.value.content.trim()) {
    ElMessage.warning('标题和内容不能为空')
    return
  }
  saving.value = true
  const payload = {
    title: editForm.value.title.trim(),
    content: editForm.value.content.trim(),
  }
  try {
    if (editingId.value) {
      // Update
      await phraseAPI.updatePhrase(editingId.value, payload)
      const idx = customPhrases.value.findIndex(p => p.id === editingId.value)
      if (idx !== -1) customPhrases.value[idx] = { id: editingId.value, ...payload }
      ElMessage.success('修改成功')
    } else {
      // Create
      const created = await phraseAPI.createPhrase(payload) as any
      customPhrases.value.unshift({
        id: String(created?.id ?? Date.now()),
        ...payload,
      })
      ElMessage.success('创建成功')
    }
    closeDialog()
  } catch {
    ElMessage.error(editingId.value ? '修改失败' : '创建失败')
  } finally {
    saving.value = false
  }
}

const deletePhrase = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条快捷短语吗？', '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await phraseAPI.deletePhrase(id)
    customPhrases.value = customPhrases.value.filter(p => p.id !== id)
    ElMessage.success('已删除')
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

onMounted(async () => {
  try {
    const data = await phraseAPI.getPhrases()
    presetPhrases.value = data.preset
    customPhrases.value = data.custom
  } catch {
    ElMessage.error('加载快捷短语失败')
  }
})
</script>

<style scoped>
/* ===== Shared overlay & modal ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-overlay.show {
  opacity: 1;
  pointer-events: auto;
}

.holo-modal {
  width: 680px;
  max-width: 94vw;
  height: 620px;
  max-height: 88vh;
  background: rgba(24, 24, 27, 0.75);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: translateY(20px) scale(0.95);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-overlay.show .holo-modal {
  transform: translateY(0) scale(1);
}

/* Smaller edit dialog */
.edit-dialog {
  width: 480px;
  height: auto;
  max-height: 70vh;
}

/* ===== Header ===== */
.modal-header {
  padding: 24px 28px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.modal-title {
  font-size: 18px;
  color: var(--text-primary);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-title i {
  color: var(--accent-primary);
  opacity: 0.9;
}

.close-modal {
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 18px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  transition: background 0.2s, color 0.2s;
}
.close-modal:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

/* ===== Tabs ===== */
.tab-bar {
  display: flex;
  gap: 4px;
  padding: 0 28px 14px;
  flex-shrink: 0;
}

.tab-btn {
  padding: 7px 18px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
}
.tab-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}
.tab-btn.active {
  color: var(--accent-primary);
  background: var(--accent-subtle);
  border-color: rgba(99, 102, 241, 0.3);
  font-weight: 500;
}

/* ===== Main body ===== */
.modal-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0 28px 24px;
  gap: 14px;
}

/* ===== Toolbar: search + new button on same row ===== */
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.search-bar {
  flex: 1;
  position: relative;
}

.search-bar input {
  width: 100%;
  padding: 11px 12px 11px 38px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 13px;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}
.search-bar input::placeholder { color: var(--text-muted); }
.search-bar input:hover { background: rgba(0, 0, 0, 0.3); border-color: rgba(255,255,255,0.15); }
.search-bar input:focus { background: rgba(0, 0, 0, 0.4); border-color: rgba(168, 199, 250, 0.4); box-shadow: 0 0 0 2px rgba(168, 199, 250, 0.1); }

.search-bar i {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 13px;
  pointer-events: none;
}

.add-btn {
  flex-shrink: 0;
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.4);
  background: rgba(99, 102, 241, 0.1);
  color: var(--accent-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
  white-space: nowrap;
}
.add-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: var(--accent-primary);
}

/* ===== Phrase list ===== */
.phrase-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
}

/* ===== Phrase cards ===== */
.phrase-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  padding: 14px 16px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.phrase-card:hover {
  border-color: rgba(168, 199, 250, 0.4);
  background: rgba(168, 199, 250, 0.05);
  transform: translateX(3px);
}

.phrase-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

/* Content: single line truncated by default */
.phrase-content {
  font-size: 12.5px;
  color: var(--text-secondary);
  line-height: 1.55;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}



/* Custom card header with action icons */
.phrase-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.phrase-card-header .phrase-title { margin-bottom: 0; }

.phrase-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}
.custom-card:hover .phrase-actions { opacity: 1; }

.action-icon {
  font-size: 13px;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}
.edit-icon { color: var(--text-muted); }
.edit-icon:hover { color: var(--accent-primary); background: rgba(99, 102, 241, 0.15); }
.delete-icon { color: var(--text-muted); }
.delete-icon:hover { color: #f87171; background: rgba(248, 113, 113, 0.15); }

/* ===== Empty state ===== */
.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-muted);
}
.empty-state i { font-size: 40px; margin-bottom: 12px; display: block; }
.empty-state p { font-size: 14px; margin: 0 0 6px; }
.empty-state span { font-size: 12px; opacity: 0.7; }

/* ===== Edit dialog body — matches ModelConfig style ===== */
.modal-content-area {
  padding: 0 28px 28px;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}
.form-input::placeholder, .form-textarea::placeholder { color: var(--text-muted); }
.form-input:hover, .form-textarea:hover { background: rgba(0, 0, 0, 0.3); border-color: rgba(255, 255, 255, 0.15); }
.form-input:focus, .form-textarea:focus { background: rgba(0, 0, 0, 0.4); border-color: rgba(168, 199, 250, 0.4); box-shadow: 0 0 0 2px rgba(168, 199, 250, 0.1); }
.form-textarea { resize: vertical; min-height: 120px; line-height: 1.6; }

.modal-footer {
  margin-top: 28px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.save-btn,
.confirm-btn {
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  font-family: inherit;
}
.save-btn { background: var(--accent-primary); color: #062e6f; }
.save-btn:hover:not(:disabled) { background: #c2d7f8; transform: translateY(-1px); }
.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.confirm-btn.cancel { background: rgba(255, 255, 255, 0.06); color: var(--text-primary); border-color: var(--glass-border); }
.confirm-btn.cancel:hover { background: rgba(255, 255, 255, 0.1); }
</style>

<!-- Global: el-tooltip popper for phrase content preview -->
<style>
.phrase-tooltip.el-popper {
  max-width: 160px;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 13px;
  line-height: 1.65;
  padding: 10px 14px;
  border-radius: 10px;
}
</style>

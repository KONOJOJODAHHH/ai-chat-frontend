<template>
  <!-- 提示词库模态框 -->
  <div class="modal-overlay" :class="{ show: modelValue }" @click.self="closeModal">
    <div class="holo-modal">
      <div class="modal-header">
        <div class="modal-title">
          <i class="fa-solid fa-lightbulb"></i> 提示词库
        </div>
        <i class="fa-solid fa-xmark close-modal" @click="closeModal"></i>
      </div>
      
      <div class="modal-body">
        <div class="modal-sidebar">
          <div class="modal-tab" :class="{ active: currentTab === 'system' }" @click="currentTab = 'system'">
            系统预设
          </div>
          <div class="modal-tab" :class="{ active: currentTab === 'custom' }" @click="currentTab = 'custom'">
            自定义
          </div>
        </div>
        
        <!-- 系统预设提示词 -->
        <div class="modal-content-area" v-show="currentTab === 'system'">
          <div class="search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="搜索提示词..." v-model="searchQuery" />
          </div>

          <div class="prompt-list">
            <div 
              v-for="prompt in filteredSystemPrompts" 
              :key="prompt.id"
              class="prompt-card" 
              @click="usePrompt(prompt.content)"
            >
              <div class="prompt-card-title">{{ prompt.title }}</div>
              <div class="prompt-card-content">{{ prompt.content }}</div>
            </div>
          </div>
        </div>

        <!-- 自定义提示词 -->
        <div class="modal-content-area" v-show="currentTab === 'custom'">
          <button class="add-btn" @click="showAddForm = true">
            <i class="fa-solid fa-plus"></i> 添加自定义提示词
          </button>

          <div class="search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="搜索我的提示词..." v-model="searchQuery" />
          </div>

          <div class="prompt-list">
            <div 
              v-for="prompt in filteredCustomPrompts" 
              :key="prompt.id"
              class="prompt-card" 
              @click="usePrompt(prompt.content)"
            >
              <div class="prompt-card-title">{{ prompt.title }}</div>
              <div class="prompt-card-content">{{ prompt.content }}</div>
              <div class="prompt-card-actions" @click.stop>
                <div class="prompt-action-btn" @click="editPrompt(prompt)">
                  <i class="fa-solid fa-pen"></i>
                </div>
                <div class="prompt-action-btn" @click="deletePrompt(prompt.id)">
                  <i class="fa-solid fa-trash"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 添加/编辑自定义提示词模态框 -->
  <div class="modal-overlay" :class="{ show: showAddForm }" @click.self="showAddForm = false">
    <div class="holo-modal form-modal">
      <div class="modal-header">
        <div class="modal-title">{{ editingPrompt ? '编辑提示词' : '添加提示词' }}</div>
        <i class="fa-solid fa-xmark close-modal" @click="closeAddForm"></i>
      </div>
      <div class="modal-body">
        <div class="modal-content-area">
          <div class="form-group">
            <label class="form-label">标题</label>
            <input type="text" class="form-input" v-model="formData.title" placeholder="例如：项目周报模板">
          </div>
          <div class="form-group">
            <label class="form-label">内容</label>
            <textarea class="form-textarea" v-model="formData.content" placeholder="输入提示词内容..."></textarea>
          </div>
          <button class="save-btn" @click="savePrompt">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminAPI } from '@/utils/api'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 
  'update:modelValue': [boolean]
  apply: [string] 
}>()

const currentTab = ref('system')
const searchQuery = ref('')
const showAddForm = ref(false)
const editingPrompt = ref<any>(null)
const formData = ref({ title: '', content: '' })

// 系统预设提示词
const systemPrompts = ref([
  { id: 1, title: '💻 代码解释与优化', content: '请帮我解释这段代码的逻辑，并提供优化建议：\n' },
  { id: 2, title: '☕ SpringBoot CRUD 生成', content: '请生成一个 Java SpringBoot 的 RESTful API Controller，包含完整的 CRUD 操作和异常处理。' },
  { id: 3, title: '🐍 Python 自动化脚本', content: '写一个 Python 脚本，用于批量处理文件夹下的文件，要求：\n1. 支持多种文件格式\n2. 包含错误处理\n3. 添加进度显示' },
  { id: 4, title: '✉️ 邮件专业润色', content: '请帮我润色以下邮件，使其更加专业、礼貌且具有说服力：\n' },
  { id: 5, title: '📝 文章标题生成器', content: '请为以下技术文章生成 5 个吸引人的标题，要求简洁、专业且包含关键词：\n' },
  { id: 6, title: '🧠 CoT 深度推理', content: '请使用思维链（Chain of Thought）方法，一步步分析以下问题的根本原因和解决方案：\n' },
  { id: 7, title: '🗄️ 数据库设计', content: '请设计一个数据库表结构，要求：\n1. 符合第三范式\n2. 包含必要的索引\n3. 添加字段注释\n\n业务需求：' },
  { id: 8, title: '⚖️ 技术选型分析', content: '请帮我进行技术选型分析，对比以下方案的优缺点：\n' }
])

// 自定义提示词
const customPrompts = ref([
  { id: 101, title: '📊 项目周报模板', content: '帮我写一份项目周报，包含：本周完成工作、遇到的问题、下周计划' }
])

const filteredSystemPrompts = computed(() => {
  if (!searchQuery.value) return systemPrompts.value
  return systemPrompts.value.filter(p => 
    p.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.content.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const filteredCustomPrompts = computed(() => {
  if (!searchQuery.value) return customPrompts.value
  return customPrompts.value.filter(p => 
    p.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.content.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const closeModal = () => {
  emit('update:modelValue', false)
  searchQuery.value = ''
}

const usePrompt = (content: string) => {
  emit('apply', content)
  closeModal()
}

const editPrompt = (prompt: any) => {
  editingPrompt.value = prompt
  formData.value = { title: prompt.title, content: prompt.content }
  showAddForm.value = true
}

const deletePrompt = (id: number) => {
  ElMessageBox.confirm('确定要删除这个提示词吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    customPrompts.value = customPrompts.value.filter(p => p.id !== id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const closeAddForm = () => {
  showAddForm.value = false
  editingPrompt.value = null
  formData.value = { title: '', content: '' }
}

const savePrompt = () => {
  if (!formData.value.title || !formData.value.content) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  if (editingPrompt.value) {
    // 编辑
    const index = customPrompts.value.findIndex(p => p.id === editingPrompt.value.id)
    if (index !== -1) {
      customPrompts.value[index] = { ...editingPrompt.value, ...formData.value }
    }
    ElMessage.success('修改成功')
  } else {
    // 新增
    customPrompts.value.push({
      id: Date.now(),
      ...formData.value
    })
    ElMessage.success('添加成功')
  }
  
  closeAddForm()
}

onMounted(async () => {
  // 可以从后端加载提示词
  // try {
  //   const data = await adminAPI.listPrompts()
  //   customPrompts.value = data
  // } catch (error) {
  //   console.error('Failed to load prompts:', error)
  // }
})
</script>
<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(5px);
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-overlay.show {
  opacity: 1;
  pointer-events: auto;
}

.holo-modal {
  width: 900px;
  height: 600px;
  max-height: 85vh;
  background: rgba(24, 24, 27, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  transform: scale(0.9);
  transition: transform 0.3s var(--ease-out);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-overlay.show .holo-modal {
  transform: scale(1);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-family: 'Orbitron';
  font-size: 18px;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-modal {
  cursor: pointer;
  color: var(--text-muted);
  font-size: 20px;
  transition: color 0.2s;
}

.close-modal:hover {
  color: white;
}

.modal-body {
  padding: 0;
  display: flex;
  flex: 1;
  overflow: hidden;
}

.modal-sidebar {
  width: 220px;
  background: rgba(255,255,255,0.02);
  border-right: 1px solid var(--glass-border);
  padding: 20px 0;
}

.modal-tab {
  padding: 12px 20px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.modal-tab:hover {
  color: white;
  background: rgba(255,255,255,0.05);
}

.modal-tab.active {
  color: var(--accent-hover);
  border-left-color: var(--accent-primary);
  background: var(--accent-subtle);
}

.modal-content-area {
  flex: 1;
  padding: 25px;
  overflow-y: auto;
}

.search-box {
  margin-bottom: 20px;
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
}

.search-box input:focus {
  border-color: var(--accent-primary);
  outline: none;
}

.search-box i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.add-btn {
  width: 100%;
  margin-bottom: 20px;
  padding: 12px 24px;
  background: var(--accent-primary);
  color: #062e6f;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}

.add-btn:hover {
  background: var(--accent-hover);
  transform: scale(1.02);
}

.prompt-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prompt-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--glass-border);
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.prompt-card:hover {
  border-color: var(--accent-primary);
  background: var(--accent-subtle);
  transform: translateX(4px);
}

.prompt-card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.prompt-card-content {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prompt-card-actions {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.prompt-card:hover .prompt-card-actions {
  opacity: 1;
}

.prompt-action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(0,0,0,0.5);
  border: 1px solid var(--glass-border);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s;
}

.prompt-action-btn:hover {
  background: rgba(0,0,0,0.8);
  color: white;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--accent-primary);
  outline: none;
}

.form-textarea {
  resize: vertical;
  min-height: 150px;
  line-height: 1.6;
}

.save-btn {
  width: 100%;
  padding: 12px 24px;
  background: var(--accent-primary);
  color: #062e6f;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}

.save-btn:hover {
  background: var(--accent-hover);
  transform: scale(1.02);
}

.form-modal {
  width: 600px !important;
  max-height: 70vh;
}

@media (max-width: 768px) {
  .holo-modal {
    width: 95%;
  }
  
  .modal-sidebar {
    width: 120px;
  }
}
</style>

# AI Chat 设计改造说明

## 🎨 设计理念

本次改造基于 gemini3.html 的设计风格，打造了一个现代化、科技感十足的 AI 对话界面。

## ✨ 主要特性

### 1. 视觉设计
- **极光背景**: 动态渐变背景，营造科技氛围
- **玻璃拟态**: 所有卡片采用毛玻璃效果，半透明设计
- **深色主题**: 护眼的深色配色方案
- **动画效果**: 流畅的过渡和滑入动画

### 2. 设计系统

#### 颜色变量
```css
--bg-color: #0a0a0a;              /* 主背景色 */
--glass-bg: rgba(23, 23, 23, 0.6); /* 玻璃背景 */
--accent-primary: #A8C7FA;         /* 主题色 */
--text-primary: #ececec;           /* 主文字色 */
--text-secondary: #9ca3af;         /* 次要文字色 */
```

#### 字体系统
- **Inter**: 主要正文字体
- **Orbitron**: 标题和Logo字体（科技感）
- **JetBrains Mono**: 代码字体

### 3. 组件改造

#### ChatPage (主页面)
- 采用左右布局，左侧侧边栏 + 右侧聊天区
- 顶部导航栏包含模型配置和用户菜单
- 响应式设计，移动端自适应

#### ConversationSidebar (对话侧边栏)
- MATRIX OS Logo 设计
- 玻璃拟态卡片
- 悬停动画效果
- 内联操作菜单

#### ChatMessage (消息组件)
- AI 和用户消息区分显示
- 代码高亮支持
- 滑入动画
- 悬停显示操作按钮

#### ChatInput (输入组件)
- **悬浮舱设计**: 底部悬浮输入框
- 加号菜单：提示词和文件上传
- 自适应高度
- 发送按钮动画

#### ModelConfig (模型配置)
- 全屏模态框
- 模型选择下拉框
- 系统提示词编辑
- API 密钥配置

#### PromptPanel (提示词面板)
- 侧边栏分类（系统预设/自定义）
- 搜索功能
- 卡片式展示
- 添加/编辑/删除功能

### 4. 图标系统
使用 Font Awesome 6.5.1 免费图标库

常用图标：
- `fa-cube`: Logo
- `fa-robot`: AI 头像
- `fa-user`: 用户头像
- `fa-lightbulb`: 提示词
- `fa-bolt`: 模型/设置
- `fa-plus`: 新建/添加

### 5. 动画效果

```css
/* 滑入动画 */
@keyframes slideIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 思考动画 */
@keyframes pulse {
  0%, 100% { height: 8px; opacity: 0.5; }
  50% { height: 16px; opacity: 1; }
}
```

## 📦 文件清单

### 修改的文件
- `index.html` - 引入字体和图标
- `src/style.css` - 全局样式和 CSS 变量
- `src/App.vue` - 添加极光背景
- `tailwind.config.js` - 扩展主题配置

### 重构的组件
- `src/pages/ChatPage.vue`
- `src/components/ConversationSidebar.vue`
- `src/components/ChatMessage.vue`
- `src/components/ChatInput.vue`
- `src/components/ModelConfig.vue`
- `src/components/PromptPanel.vue`

### 新增组件
- `src/components/ThinkingIndicator.vue` - 思考动画指示器

## 🚀 使用建议

1. **保持一致性**: 所有新组件都应遵循 gemini3 的设计语言
2. **响应式优先**: 确保在移动端也有良好体验
3. **性能优化**: 使用 CSS 动画而非 JS 动画
4. **无障碍性**: 保持良好的颜色对比度和键盘导航

## 🎯 未来优化方向

1. 添加主题切换功能（浅色/深色）
2. 更多动画效果和交互细节
3. 自定义配色方案
4. 语音输入/输出支持
5. 实时消息流式显示
6. 代码块语法高亮增强

## 📱 响应式断点

```css
@media (max-width: 768px) {
  /* 移动端适配 */
  .conversation-sidebar { display: none; }
  .chat-input-wrapper { width: 90%; }
}
```

## 🔧 技术栈

- Vue 3 + TypeScript
- Tailwind CSS
- Font Awesome 6
- Google Fonts (Inter, Orbitron, JetBrains Mono)
- Element Plus (保留部分组件如 Message, MessageBox)

---

**设计灵感来源**: gemini3.html - DeepSeek Matrix Commander V5.0

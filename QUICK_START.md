# 🚀 快速启动指南

## 项目改造说明

您的 AI Chat 项目已成功改造为 **MATRIX OS** 风格！

---

## 📦 安装依赖

```bash
npm install
```

---

## 🎬 启动开发服务器

```bash
npm run dev
```

访问: http://localhost:5173 (或控制台显示的端口)

---

## 🎨 主要改动

### ✨ 视觉升级
- 深色科技风主题
- 玻璃拟态设计
- 极光动态背景
- 流畅过渡动画

### 🔧 功能增强
- 悬浮输入框 + 工具菜单
- 提示词库（系统预设 + 自定义）
- 模型配置模态框
- 优化的侧边栏交互

---

## 📂 核心文件

```
改造的主要文件:
├── index.html (引入字体和图标)
├── src/
│   ├── style.css (全局样式系统)
│   ├── App.vue (极光背景)
│   ├── pages/
│   │   ├── ChatPage.vue (主界面)
│   │   └── LoginPage.vue (登录页)
│   └── components/
│       ├── ConversationSidebar.vue (侧边栏)
│       ├── ChatMessage.vue (消息)
│       ├── ChatInput.vue (输入框)
│       ├── ModelConfig.vue (模型配置)
│       ├── PromptPanel.vue (提示词库)
│       └── ThinkingIndicator.vue (思考动画)
```

---

## 🎯 使用技巧

### 1. 提示词库
- 点击输入框左侧的 **+** 按钮
- 选择 "提示词模板"
- 浏览系统预设或添加自定义

### 2. 模型配置
- 点击顶部导航栏的 **⚡ 模型名称**
- 切换不同的 AI 模型
- 设置系统提示词

### 3. 对话管理
- 点击左侧 "新建对话" 创建对话
- 悬停对话项显示操作菜单
- 支持重命名和删除

### 4. 消息操作
- 悬停 AI 消息显示操作按钮
- 支持复制和重新生成

---

## 🎨 自定义配色

在 `src/style.css` 中修改 CSS 变量:

```css
:root {
  --accent-primary: #A8C7FA;  /* 主题色 */
  --bg-color: #0a0a0a;        /* 背景色 */
  --text-primary: #ececec;    /* 文字色 */
}
```

---

## 📱 响应式设计

- **桌面端**: 完整的三栏布局
- **移动端**: 隐藏侧边栏，全屏内容

测试移动端: 按 `F12` 打开开发者工具 → 切换设备模拟器

---

## 🐛 常见问题

### Q: 样式没有生效？
A: 确保已引入 Font Awesome 和 Google Fonts (检查 index.html)

### Q: 图标不显示？
A: 检查网络连接，Font Awesome CDN 可能需要科学上网

### Q: 输入框菜单点击无反应？
A: 检查 `ChatInput.vue` 的事件监听是否正确绑定

---

## 🔗 相关文档

- [详细设计说明](./DESIGN_UPDATE.md)
- [改造完成总结](./REDESIGN_SUMMARY.md)
- [原始项目 README](./README.md)

---

## 💡 提示

1. 首次运行可能需要下载字体，请耐心等待
2. 建议使用 Chrome/Edge/Firefox 现代浏览器
3. 开发时打开浏览器开发者工具查看动画效果
4. 自定义提示词会保存在组件状态中（可接入后端持久化）

---

**享受全新的 MATRIX OS 体验！** 🚀✨

如有问题，请查看详细文档或联系开发者。

# AI智能对话系统 - 前端

基于Vue 3 + TypeScript + Element Plus构建的多模型智能对话系统前端。

## 功能特性

- 🎯 **多模型支持**: 支持DeepSeek、豆包等多种AI大模型
- 💬 **对话管理**: 完整的对话历史记录和管理功能
- 🎨 **现代化UI**: 基于Element Plus的美观界面设计
- 📱 **响应式设计**: 适配各种屏幕尺寸
- ⚡ **实时交互**: 流畅的聊天体验
- 🔧 **模型配置**: 灵活的模型参数配置

## 技术栈

- **框架**: Vue 3 + TypeScript
- **UI库**: Element Plus
- **路由**: Vue Router
- **状态管理**: Vue Composition API
- **HTTP客户端**: Axios
- **构建工具**: Vite
- **样式**: Tailwind CSS

## 项目结构

```
src/
├── components/          # 公共组件
│   ├── ChatInput.vue    # 聊天输入组件
│   ├── ChatMessage.vue  # 消息显示组件
│   ├── ConversationSidebar.vue # 对话侧边栏
│   └── ModelConfig.vue  # 模型配置组件
├── composables/         # 组合式函数
│   ├── useChatStore.ts  # 聊天状态管理
├── pages/               # 页面组件
│   └── ChatPage.vue     # 主聊天页面
├── router/              # 路由配置
├── utils/               # 工具函数
│   └── api.ts          # API服务
└── main.ts             # 入口文件
```

## 快速开始

### 前置要求
- Node.js 16+ 
- npm 或 yarn

### 安装依赖
```bash
npm install
```
或
```bash
yarn install
```

### 开发环境运行
```bash
npm run dev
```
访问: http://localhost:5173

### 生产环境构建
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 项目分享说明

**如果你要分享这个项目，不需要包含以下文件夹：**
- `node_modules/` - 依赖包文件夹（几百MB，接收者需要自己运行 `npm install`）
- `dist/` - 构建输出文件夹
- `.vite/` - Vite 缓存文件夹

**接收者拿到项目后的操作步骤：**
1. 解压项目文件
2. 在项目根目录打开终端
3. 运行 `npm install` 安装所有依赖
4. 运行 `npm run dev` 启动开发服务器
5. 访问 http://localhost:5173

**快速打包脚本：**
项目根目录有 `pack-project.bat` 脚本，双击运行即可自动打包项目（自动排除 node_modules）。

## API配置

在 `.env` 文件中配置后端API地址：
```
VITE_API_BASE_URL=http://localhost:8080/api
```

## 主要功能模块

### 1. 聊天界面
- 消息输入和发送
- 实时消息显示
- 代码块语法高亮
- 消息复制和重新生成

### 2. 对话管理
- 新建对话
- 对话历史列表
- 对话重命名和删除
- 对话时间排序

### 3. 模型管理
- 模型切换
- API密钥配置
- 基础地址配置
- 模型连接测试

### 4. 状态管理
- 对话数据管理
- 模型状态管理
- 加载状态管理
- 消息历史管理

## 组件说明

### ChatInput.vue
聊天输入组件，提供：
- 多行文本输入
- 快捷键支持（Enter发送，Ctrl+Enter换行）
- 发送/清空/重新生成功能
- 加载状态显示

### ChatMessage.vue
消息显示组件，提供：
- 用户和AI消息区分显示
- 时间戳格式化
- 代码块格式化显示
- 消息复制功能
- 重新生成功能

### ConversationSidebar.vue
对话侧边栏组件，提供：
- 对话列表显示
- 新建对话按钮
- 对话选择和切换
- 对话重命名和删除
- 时间格式化显示

### ModelConfig.vue
模型配置组件，提供：
- 模型列表显示
- 模型切换
- API密钥配置
- 基础地址配置
- 连接测试功能

## 开发说明

### 状态管理
使用Vue Composition API进行状态管理，主要状态包括：
- 对话列表和当前对话
- 模型列表和当前模型
- 加载状态
- 消息历史

### API集成
通过axios与后端API通信，主要接口包括：
- 发送消息：`POST /api/chat`
- 获取对话列表：`GET /api/conversations`
- 删除对话：`DELETE /api/conversations/{id}`
- 模型管理：`GET/PUT /api/models`

### 错误处理
- API请求错误统一处理
- 用户操作反馈（成功/失败提示）
- 网络异常处理

## 待办事项

- [ ] 文件上传功能
- [ ] 消息搜索功能
- [ ] 导出对话功能
- [ ] 主题切换功能
- [ ] 国际化支持
- [ ] 消息编辑功能
- [ ] 语音输入功能

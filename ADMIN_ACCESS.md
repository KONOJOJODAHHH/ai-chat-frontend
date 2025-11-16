# 管理员后台访问指南

## 访问方式

### 1. 登录管理员账号
管理员后台需要使用具有管理员权限的账号登录。

**默认管理员账号：**
- 用户名：`admin`
- 密码：任意（Mock模式下）

当使用用户名 `admin` 登录时，系统会自动赋予管理员权限。

### 2. 访问后台路径
登录管理员账号后，直接在浏览器地址栏访问：

```
http://localhost:5173/admin
```

或访问具体的管理页面：

```
http://localhost:5173/admin/dashboard   # 仪表盘
http://localhost:5173/admin/models      # 模型管理
http://localhost:5173/admin/users       # 用户管理
http://localhost:5173/admin/sessions    # 会话管理
http://localhost:5173/admin/config      # 系统配置
http://localhost:5173/admin/logs        # 日志查看
http://localhost:5173/admin/prompts     # 提示词管理
```

### 3. 权限验证
- 系统会检查用户的 `role` 字段是否为 `admin`
- 非管理员账号访问 `/admin` 路径会被自动重定向到首页
- 未登录用户会被重定向到登录页

## 路由守卫逻辑

在 `src/router/index.ts` 中配置了路由守卫：

```typescript
router.beforeEach((to) => {
  const auth = useAuthStore()
  
  // 检查是否需要登录
  if (to.meta?.requiresAuth && !auth.isAuthenticated.value) {
    return { path: '/login' }
  }
  
  // 检查是否需要管理员权限
  if ((to.meta as any)?.requireAdmin && auth.user.value?.role !== 'admin') {
    return { path: '/' }
  }
  
  return true
})
```

## 后台页面说明

| 页面 | 路径 | 功能 |
|------|------|------|
| 仪表盘 | `/admin/dashboard` | 系统概览、统计数据 |
| 模型管理 | `/admin/models` | AI模型配置、启用/禁用 |
| 用户管理 | `/admin/users` | 用户列表、权限管理 |
| 会话管理 | `/admin/sessions` | 查看所有用户会话记录 |
| 系统配置 | `/admin/config` | 全局系统参数设置 |
| 日志查看 | `/admin/logs` | 系统操作日志 |
| 提示词管理 | `/admin/prompts` | 系统提示词模板管理 |

## 注意事项

1. **生产环境安全**：当前使用的是 Mock API，生产环境需要后端验证 JWT token 和管理员权限。

2. **角色管理**：在 `src/utils/mockApi.ts` 中，`admin` 用户名会自动获得管理员角色：
   ```typescript
   const role = data.username.toLowerCase() === 'admin' ? 'admin' : 'user'
   ```

3. **首次访问**：建议先访问 `/admin/dashboard`，再通过侧边栏导航到其他管理页面。

4. **布局结构**：管理后台使用独立的 `AdminLayout.vue` 布局，包含侧边导航栏。

## 测试步骤

1. 打开登录页面：`http://localhost:5173/login`
2. 使用管理员账号登录：
   - 用户名：`admin`
   - 密码：`123456`（或任意密码）
3. 登录成功后手动访问：`http://localhost:5173/admin`
4. 查看管理后台界面

## 未来改进建议

- [ ] 在主界面添加"管理后台"入口（仅管理员可见）
- [ ] 在用户菜单中添加"后台管理"选项
- [ ] 实现完整的角色权限系统（RBAC）
- [ ] 添加二次验证保护敏感操作

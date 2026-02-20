# Pages 目录结构

本目录包含 Jobcc（LinkedAI）平台的所有页面组件。

## 📁 文件列表

### 1. **home-page.tsx** - 首页
- 路径: `/`
- 功能:
  - 欢迎界面和任务输入
  - 展示用户的 AI 团队列表
  - 快速创建新团队
  - 呼叫团队功能
  - 上传文件功能

### 2. **workspace-page.tsx** - 工作台
- 路径: `/workspace/:projectId?`
- 功能:
  - 项目执行界面
  - AI 员工对话和协作
  - 知识库管理
  - 项目文件管理
  - 用户干预卡片
  - 思考过程展示（动效优化）

### 3. **talent-market-page.tsx** - 人才市场
- 路径: `/talent-market`
- 功能:
  - 浏览所有 AI 员工
  - 搜索和筛选员工
  - 查看员工详情
  - 雇佣 AI 员工
  - 分类浏览（数据分析、内容创作、设计等）

### 4. **team-config-page.tsx** - 团队配置
- 路径: `/team-config/:teamId?`
- 功能:
  - 创建新团队
  - 编辑现有团队
  - 选择 AI 员工
  - 配置工作流（流水线、脑暴组、对抗组）
  - 设置团队名称和描述

## 📦 导出方式

所有页面通过 `index.ts` 统一导出：

```typescript
import { 
  HomePage, 
  WorkspacePage, 
  TalentMarketPage, 
  TeamConfigPage 
} from "./pages";
```

## 🔗 路由配置

路由配置在 `/src/app/routes.tsx` 文件中：

```typescript
export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "workspace/:projectId?", Component: WorkspacePage },
      { path: "talent-market", Component: TalentMarketPage },
      { path: "team-config/:teamId?", Component: TeamConfigPage },
    ],
  },
]);
```

## 🎨 设计规范

所有页面遵循统一的设计规范：
- 使用 Tailwind CSS v4
- 采用 shadcn/ui 组件库
- 响应式设计
- 统一的色彩系统和间距
- 流畅的动画效果

## 📚 相关目录

- `/src/app/components` - 可复用组件
- `/src/app/data` - Mock 数据
- `/src/app/types` - TypeScript 类型定义

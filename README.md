# 万能投票工具

面向校内选举、民主测评、作品投票的一体化投票平台。项目依据《万能投票工具项目设计报告》开发，已完成前后端完整功能，包括角色权限管理、任务配置、账号上传、投票参与、统计分析和数据导出等核心流程。

## 一、功能概览

### 前台功能
- **首页展示**：展示已发布任务，支持搜索、查看详情、登录参与或免密投票
- **校内选举**：候选对象展示、匿名投票、最多可选数量限制、得票排名
- **民主测评**：多个对象共用同一套题目，支持评分题、等级评价题和维度统计
- **作品投票**：作品简介、作者信息、图片展示、附件下载、单选/多选投票和排名

### 后台功能
- **任务管理**：新建任务、编辑基本信息、配置题目与对象、发布、取消和删除
- **用户管理**：管理员可管理所有用户账号（创建、编辑、删除）
- **角色权限**：管理员查看所有任务，普通用户只查看自己创建的任务
- **账号管理**：上传 CSV 文件导入账号密码，支持账号下载和提交状态记录
- **数据统计**：应参与人数、已完成人数、完成率、得票数、测评总分、维度均分
- **数据导出**：统计结果和账号列表导出为 CSV

### 登录方式
- **免密参与**：无需账号密码，直接参与投票
- **指定账号**：上传 CSV 文件导入账号密码，只有指定账号可参与

## 二、技术栈

### 前端
- Vite 6.x
- React 18
- lucide-react（图标库）
- 自定义 CSS 样式

### 后端
- Node.js
- Express.js
- SQLite3（文件数据库）
- Session 认证

## 三、目录结构

```text
voting-tool/
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── server/
│   ├── app.js          # Express 后端服务器
│   ├── db.js           # SQLite3 数据库操作
│   └── package.json
├── src/
│   ├── App.jsx         # 主应用组件（当前使用）
│   ├── data.js         # 常量和初始数据
│   ├── main.jsx        # 入口文件
│   └── style.css       # 样式文件
└── docs/
    └── 开发日志.md
```

## 四、运行方式

### 开发环境

1. 安装依赖：

```bash
npm install
cd server && npm install
```

2. 启动后端服务（端口 5000）：

```bash
node server/app.js
```

3. 启动前端开发服务器（端口 5173）：

```bash
npm run dev
```

4. 浏览器打开：

```text
http://localhost:5173
```

### 生产构建

```bash
npm run build
```

### 本地预览构建结果

```bash
npm run preview
```

## 五、登录账号

### 后台管理登录

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 管理员 | admin | admin123 | 可管理所有任务和用户 |
| 普通用户 | teacher | teacher123 | 只能管理自己创建的任务 |

### 投票参与登录

需使用发布者上传的 CSV 文件中的账号密码。

## 六、使用流程

### 发布任务

1. 登录后台管理（管理员或普通用户）
2. 点击"新建任务"，填写基本信息（任务名称、类型、登录方式等）
3. 点击"保存并继续"进入配置页面
4. 添加候选对象/测评对象/作品（可上传图片和附件）
5. 如需账号登录，上传 CSV 文件导入账号密码
6. 点击"发布任务"

### 参与投票

1. 进入前台首页，查看已发布任务
2. 免密任务点击"开始投票"，需要登录的任务点击"登录参与"
3. 输入账号密码登录（如需）
4. 完成选举、测评或作品投票后提交

### 查看统计

1. 登录后台管理
2. 选择任务，点击"统计"查看排名、完成率和维度结果
3. 使用"导出 CSV"保存统计结果

## 七、CSV 文件格式

### 账号导入 CSV

发布者需准备 CSV 文件，格式如下：

```csv
student001,password123
student002,password456
student003,password789
```

- 第一列：账号
- 第二列：密码
- 使用英文逗号分隔
- 支持以 `#` 开头的注释行

在 Excel 中编辑时，只需填写两列表格，保存为"CSV (逗号分隔)"格式即可。

## 八、API 接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户

### 用户管理（管理员）
- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

### 任务管理
- `GET /api/tasks` - 获取任务列表
- `GET /api/tasks/:id` - 获取单个任务
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务

### 公开接口
- `GET /api/public/tasks` - 获取公开任务列表
- `GET /api/public/tasks/:id` - 获取单个公开任务
- `POST /api/accounts/verify` - 验证投票账号
- `POST /api/tasks/:id/submit` - 提交投票记录

## 九、数据库说明

数据保存在 `server/voting.db` SQLite 文件中，包含两张表：

- `users`：用户表（id, username, password, name, role）
- `tasks`：任务表（包含对象、题目、账号、记录等 JSON 字段）

首次启动时会自动初始化管理员账号和示例数据。

## 十、注意事项

1. 上传图片大小限制：3MB
2. 上传附件大小限制：5MB
3. 任务数据包含图片 base64 编码，数据库文件可能较大
4. 建议定期备份 `server/voting.db` 文件

## 十一、已验证命令

```bash
npm install
cd server && npm install
node server/app.js
npm run dev
npm run build
```

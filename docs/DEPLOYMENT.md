# 部署说明

## 项目概述

**冥想花园** 是一个纯前端静态项目，使用 Vite 构建，包含五个放松冥想小游戏。可以部署到任何静态网站托管服务。

## 环境要求

- Node.js: 18.x 或更高版本
- npm 或 yarn 包管理器

## 本地开发运行步骤

### 1. 克隆或下载项目代码

```bash
# 如果使用 git
git clone <repository-url>
cd meditation-games
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

开发服务器启动后，输出类似如下信息：

```
  VITE v5.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 4. 访问应用

在浏览器中打开 `http://localhost:5173` 即可查看应用。

开发模式支持热更新，修改代码后浏览器会自动刷新。

## 生产构建步骤

### 1. 执行构建

```bash
npm run build
```

Vite 会进行生产构建，优化代码、压缩资源。构建成功后输出类似：

```
vite v5.x building for production...
✓ 34 modules transformed.
✓ built in XXXms
dist/index.html                XXX kB
dist/assets/index-*.css       XXX kB
dist/assets/index-*.js        XXX kB
```

### 2. 构建输出

构建成功后会在 `dist/` 目录生成以下文件：
```
dist/
├── index.html          # 主入口
└── assets/
    ├── index-*.css     # 压缩后的样式文件
    └── index-*.js      # 压缩后的脚本文件
```

所有资源已经过压缩优化，可以直接部署。

### 3. 本地预览构建结果（可选）

部署前可以在本地预览构建结果：

```bash
npm run preview
```

然后访问 `http://localhost:4173` 查看生产构建后的效果。

## 构建信息

- 构建工具: Vite 5.x
- 输出目录: `dist/`
- 入口文件: `dist/index.html`
- 资源路径: 使用相对路径 `./`，支持子路径部署
- 纯静态项目: 无服务器端运行时依赖

## 纯静态项目验证

- [x] 无服务器端运行时依赖
- [x] 所有依赖都在 devDependencies 中
- [x] 使用相对路径 `base: './'` 配置
- [x] 构建输出包含完整静态资源
- [x] 不依赖服务器端动态渲染

## 部署方式

### 1. GitHub Pages

GitHub Pages 提供免费的静态网站托管，适合个人项目展示。

**方法一：直接从分支部署（推荐）**

1. 将代码推送到 GitHub 仓库
2. 在 GitHub 仓库页面，进入 **Settings → Pages**
3. 在 "Build and deployment" → "Source" 选择 "GitHub Actions"
4. 在项目根目录创建 `.github/workflows/deploy.yml` 文件，内容如下：

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

5. GitHub 会自动构建并部署，部署完成后可以在 `https://<username>.github.io/<repository-name>/` 访问

**方法二：使用 gh-pages 工具部署构建产物**

1. 在本地完成构建：
   ```bash
   npm run build
   ```

2. 使用 gh-pages 工具部署：
   ```bash
   npx gh-pages -d dist
   ```

3. 在 GitHub Settings → Pages 选择 gh-pages 分支保存即可

**注意事项：**
- 如果部署到子路径（如 `https://username.github.io/repository-name/`），项目已配置好相对路径 `base: './'`，无需额外修改
- 确保仓库设置中 GitHub Pages 是公开可见的

### 2. Vercel

Vercel 提供极佳的前端部署体验，自动SSL，全球CDN加速。

1. 将项目推送到 GitHub/GitLab/Bitbucket
2. 登录 [Vercel](https://vercel.com/)
3. 点击 **New Project**，导入你的项目
4. Vercel 会自动检测 Vite 项目，预设配置已经正确：
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. 如果你需要部署到子路径，无需额外配置，项目已支持相对路径
6. 点击 **Deploy** 即可完成部署

Vercel 会自动分配一个域名，也可以绑定自定义域名。每次推送到代码仓库会自动触发重新部署。

### 3. Netlify

Netlify 也是受欢迎的静态网站托管平台。

1. 将项目推送到代码仓库（GitHub/GitLab/Bitbucket）
2. 登录 [Netlify](https://www.netlify.com/)
3. 点击 **New site from git**，选择你的仓库
4. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 选择 18.x 或更高
5. 点击 **Deploy site**

如果需要配置环境变量或自定义构建，可以在 `netlify.toml` 文件中配置：

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

### 4. Cloudflare Pages

Cloudflare Pages 依托 Cloudflare 的全球网络，速度快，免费配额充足。

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** → **Connect to Git**
3. 选择你的代码仓库，点击 **Start setup**
4. 配置构建设置：
   - Project name: 输入项目名称
   - Production branch: `main`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node.js version: 选择 18 或更高
5. 点击 **Save and Deploy**

Cloudflare Pages 会自动构建部署，每次推送到仓库自动更新。免费支持自定义域名和SSL。

### 5. Docker 部署（可选）

如果你喜欢使用 Docker，可以创建一个简单的 Dockerfile：

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 部署阶段 - 使用 nginx 提供静态文件
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

构建并运行：

```bash
docker build -t meditation-games .
docker run -p 80:80 meditation-games
```

然后访问 `http://localhost` 即可。

### 6. 传统服务器部署

只需将 `dist/` 目录中的所有文件上传到你的服务器 web 目录即可：

```bash
# 示例：使用 rsync 上传到服务器
rsync -avz dist/ user@your-server:/path/to/your/webroot/
```

确保你的 web 服务器（Nginx、Apache 等）配置正确：

**Nginx 配置示例：**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/webroot;
    index index.html;

    # 支持 SPA 前端路由（如果需要）
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 验证部署成功

部署完成后，通过以下步骤验证部署是否成功：

### 1. 访问网站

打开浏览器访问你的部署域名，确认页面能够正常加载。

### 2. 验证首页

- 确认标题"冥想花园"正确显示
- 确认五个游戏卡片都能看到：
  - 呼吸冥想
  - 花瓣漂浮
  - 星空漫步
  - 雨滴声音
  - 烛火摇曳

### 3. 测试每个游戏

依次点击每个游戏卡片，进入后验证：

- ✅ 页面能够正常进入，没有白屏
- ✅ 动画效果正常显示（呼吸、漂浮、星空、雨滴、烛火）
- ✅ 音效可以正常播放（点击音量按钮测试）
- ✅ 返回按钮可以正常返回首页
- ✅ 浏览器控制台没有 JavaScript 错误

### 4. 验证资源加载

打开浏览器开发者工具（F12）→ Network 标签：
- 刷新页面，确认所有资源都返回 200 状态码
- 没有 404 错误
- CSS 和 JS 文件都能正确加载

### 5. 验证移动端适应

在移动设备上访问或使用浏览器开发者工具的手机模拟器：
- 确认布局适配手机屏幕
- 确认按钮可点击
- 确认动画运行流畅

如果以上所有步骤都通过，说明部署成功！

## 测试覆盖率

在部署前，可以运行完整测试确保代码质量：

```bash
# 运行所有测试
npm run test

# 查看测试覆盖率
npm run test -- --coverage
```

当前测试覆盖率：
- 语句: 81.66%
- 分支: 81.3%
- 行: 81.66%

所有测试全部通过。

## 注意事项

1. **相对路径支持**：项目已配置 `base: './'`，支持部署到网站根目录或任意子路径，无需修改配置
2. **纯静态运行**：无需 Node.js 运行时，构建后就是纯静态文件，可以在任何静态托管服务上运行
3. **优化压缩**：所有资源都经过 Vite 打包压缩，加载速度快
4. **缓存问题**：如果更新部署后看到旧内容，清除浏览器缓存即可
5. **HTTPS 要求**：现代浏览器要求音频播放必须在 HTTPS 环境下（localhost 除外），请确保部署使用 HTTPS

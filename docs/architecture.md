# 冥想小游戏网站 - 架构设计文档

## 1. 整体架构

### 1.1 技术选型
- **框架**：原生 JavaScript + HTML5 + CSS3（不使用 React/Vue 等框架，保持轻量化）
- **构建工具**：Vite（快速开发和构建）
- **样式方案**：CSS 原生变量 + Flexbox/Grid 布局
- **状态管理**：原生模块内状态管理，无需全局状态库
- **存储**：localStorage（仅用于情绪调色盘保存作品，可选）
- **部署**：静态文件部署（支持任何静态网站托管）

### 1.2 架构决策
选择纯原生方案的原因：
- 项目规模小，单页应用，5 个独立小游戏
- 保持最小依赖，加载更快
- 每个游戏独立封装，互不影响
- 便于维护和扩展

---

## 2. 项目结构

```
meditation-games/
├── index.html              # 入口 HTML
├── package.json            # 项目依赖配置
├── vite.config.js          # Vite 配置
├── src/
│   ├── css/
│   │   ├── variables.css   # 颜色、字体等变量定义
│   │   ├── main.css        # 全局样式
│   │   └── games.css       # 游戏卡片样式
│   ├── js/
│   │   ├── main.js         # 入口文件，初始化
│   │   ├── card.js         # 游戏卡片展开/收起逻辑
│   │   ├── breathGarden.js # 呼吸花园游戏
│   │   ├── thoughtBottle.js # 思绪漂流瓶游戏
│   │   ├── calmDrop.js     # 平静水滴游戏
│   │   ├── mindfulLighthouse.js # 正念灯塔游戏
│   │   └── moodPalette.js  # 情绪调色盘游戏
│   └── assets/
│       └── images/         # 图片资源（如需）
├── dist/                   # 构建输出（git ignore）
└── docs/
    ├── prd.md             # 产品需求文档
    └── architecture.md    # 本文档
```

---

## 3. 设计系统

### 3.1 颜色变量（温暖风格）

```css
:root {
  /* 主色调 - 温暖柔和 */
  --primary: #f5b895;       /* 暖桃色 */
  --primary-dark: #e8a87c;
  --secondary: #a6d1c1;     /* 柔和薄荷绿 */
  --accent: #c8b6e2;        /* 淡紫色 */

  /* 背景色渐变 */
  --bg-start: #fff9f5;      /* 极浅暖米色 */
  --bg-end: #f0f8f5;

  /* 卡片背景 */
  --card-bg: rgba(255, 255, 255, 0.8);
  --card-bg-hover: rgba(255, 255, 255, 0.95);

  /* 文字颜色 */
  --text-primary: #5a4a42;  /* 暖深棕色，柔和不刺眼 */
  --text-secondary: #8a7b72;
  --text-light: #b5a9a1;

  /* 边框和阴影 */
  --border-color: #e8ddd5;
  --shadow: 0 4px 20px rgba(90, 74, 66, 0.08);
  --shadow-hover: 0 8px 30px rgba(90, 74, 66, 0.12);

  /* 圆角 */
  --radius: 16px;
  --radius-sm: 8px;
}
```

### 3.2 字体
- 标题：系统无衬线，柔和字重
- 正文：系统无衬线，良好可读性
- 字号：响应式，移动端自动适配

---

## 4. 模块设计

### 4.1 主模块 - `main.js`
**职责**：
- 页面加载初始化
- 注册所有游戏
- 绑定全局事件

**导出**：无，自执行初始化

---

### 4.2 卡片模块 - `card.js`
**职责**：
- 处理卡片点击展开/收起
- 保证同一时间只展开一个游戏
- 处理展开后的滚动动画

**接口**：
```javascript
export function initCards() { }
```

---

### 4.3 呼吸花园 - `breathGarden.js`
**状态**：
```javascript
{
  phase: 'idle' | 'inhale' | 'hold' | 'exhale' | 'complete',
  currentCycle: 0,      // 当前完成回合数 (0-5)
  growth: 0,            // 植物成长进度 (0-1)
  startTime: number,    // 阶段开始时间
}
```

**关键方法**：
- `init(container)` - 初始化游戏
- `start()` - 开始呼吸循环
- `update()` - 每帧更新动画
- `completeCycle()` - 完成一个回合，植物成长
- `reset()` - 重新开始

---

### 4.4 思绪漂流瓶 - `thoughtBottle.js`
**状态**：
```javascript
{
  bottles: [{ id, text, x, y, speed }], // 漂浮中的瓶子
  nextId: number,
}
```

**关键方法**：
- `init(container)` - 初始化
- `createBottle(text)` - 创建新瓶子
- `animate()` - 更新瓶子位置，处理漂出屏幕
- `openInputModal()` - 打开输入弹窗

---

### 4.5 平静水滴 - `calmDrop.js`
**状态**：
```javascript
{
  ripples: [{ x, y, radius, maxRadius, startTime }],
  lastClickTime: number,
}
```

**关键方法**：
- `init(container)` - 初始化
- `handleClick(event)` - 处理点击，添加新涟漪
- `animate()` - 更新涟漪扩散动画
- `getIntervalMessage(interval)` - 根据间隔给出提示

---

### 4.6 正念灯塔 - `mindfulLighthouse.js`
**状态**：
```javascript
{
  angle: 0,                // 当前光束角度
  rotationSpeed: 0.05,     // 旋转速度
  isTracking: boolean,     // 是否正在追踪
  elapsed: 0,              // 已坚持时间
  startTime: number,
}
```

**关键方法**：
- `init(container)` - 初始化
- `handleMouseMove(event)` - 检查光标是否在光束内
- `updateRotation()` - 更新光束旋转
- `checkComplete()` - 检查是否完成 30 秒

---

### 4.7 情绪调色盘 - `moodPalette.js`
**状态**：
```javascript
{
  currentColor: string,
  brushSize: number,
  isDrawing: boolean,
  canvasState: ImageData | null,
}
```

**关键方法**：
- `init(container)` - 初始化 canvas
- `selectColor(color)` - 选择当前颜色
- `startDrawing(event)` - 开始绘画
- `draw(event)` - 绘画过程
- `stopDrawing()` - 停止绘画
- `clearCanvas()` - 清空画布
- `saveCanvas()` - 保存到 localStorage

---

## 5. 性能优化策略

### 5.1 动画优化
- 使用 `requestAnimationFrame` 处理动画
- 对于非动画样式使用 `will-change` 提示浏览器
- 避免在动画中触发布局重排
- 清理已结束的涟漪/瓶子，避免内存泄漏

### 5.2 渲染优化
- 每个游戏只有在展开时才激活动画
- 收起游戏后取消动画帧，停止计算
- CSS 动画使用 GPU 加速属性（transform, opacity）

### 5.3 事件优化
- 事件委托，避免过多事件绑定
- 节流处理 mousemove 事件（正念灯塔）

---

## 6. 响应式断点

```css
/* 移动端 */
@media (max-width: 767px) {
  .games-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
}

/* 平板 */
@media (min-width: 768px) and (max-width: 1023px) {
  .games-grid {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    padding: 24px;
  }
}

/* 桌面 */
@media (min-width: 1024px) {
  .games-grid {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 32px;
    padding: 40px;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

---

## 7. 测试计划

### 单元测试
- 每个游戏模块独立测试核心逻辑
- 使用 Vitest 作为测试框架

### 测试要点
- 响应式布局在不同屏幕尺寸下是否正常
- 触摸事件在移动端是否正常
- 动画是否流畅，有无卡顿
- 多个游戏切换时状态是否正确清理

### 覆盖率目标
- 核心游戏逻辑：80%+ 覆盖率

---

## 8. 构建与部署

### 构建命令
```bash
npm run build
```
输出到 `dist/` 目录，所有文件静态可部署。

### 开发命令
```bash
npm run dev
```
本地开发服务器，热更新。

---

## 9. 待扩展
- 后续可添加更多小游戏
- 可选：添加用户冥想记录统计（仍存本地）
- 可选：添加轻柔背景音效开关

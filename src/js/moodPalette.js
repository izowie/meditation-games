/**
 * 游戏5: 情绪调色盘
 * 用色彩涂抹表达当下情绪
 */

const EMOTIONS = [
  { name: '平静', color: '#a6d1c1', class: 'color-calm' },
  { name: '喜悦', color: '#ffd93d', class: 'color-joy' },
  { name: '焦虑', color: '#ff6b6b', class: 'color-anxiety' },
  { name: '悲伤', color: '#6b8cae', class: 'color-sadness' },
  { name: '疲惫', color: '#9f9f9f', class: 'color-tired' },
  { name: '兴奋', color: '#ff8dc7', class: 'color-excited' },
  { name: '愤怒', color: '#ff5757', class: 'color-anger' }
];

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 300;

let state = {
  currentColor: EMOTIONS[0].color,
  brushSize: 10,
  isDrawing: false,
  container: null,
  canvas: null,
  ctx: null,
  lastX: 0,
  lastY: 0,
  pixelRatio: 1
};

/**
 * 初始化游戏
 */
export function initMoodPalette(container) {
  state.container = container;
  state.isDrawing = false;

  render();
  initCanvas();
  bindEvents();

  // 尝试加载保存的作品
  loadCanvas();

  // 主题切换时更新画布背景
  document.addEventListener('themeChanged', updateCanvasBackground);
}

/**
 * 渲染游戏UI
 */
function render() {
  const colorSwatches = EMOTIONS.map(emotion => `
    <div class="color-swatch ${emotion.class} ${emotion.color === state.currentColor ? 'selected' : ''}"
         data-color="${emotion.color}" title="${emotion.name}"></div>
  `).join('');

  const html = `
    <div class="mood-palette">
      <div class="mood-canvas-container">
        <canvas id="moodCanvas" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"></canvas>
      </div>
      <div class="color-palette" id="colorPalette">
        ${colorSwatches}
      </div>
      <div class="palette-controls">
        <div class="brush-size-control">
          <label>笔触大小</label>
          <input type="range" id="brushSize" min="5" max="30" value="${state.brushSize}">
          <span id="brushSizeValue">${state.brushSize}</span>
        </div>
        <div class="palette-buttons">
          <button class="btn btn-secondary" id="clearBtn">清空</button>
          <button class="btn" id="saveBtn">保存</button>
        </div>
      </div>
    </div>
  `;

  state.container.innerHTML = html;
  state.canvas = document.getElementById('moodCanvas');
}

/**
 * 初始化 Canvas
 */
function initCanvas() {
  const ctx = state.canvas.getContext('2d');
  state.ctx = ctx;

  // 适配高DPI屏幕
  const pixelRatio = window.devicePixelRatio || 1;
  state.pixelRatio = pixelRatio;

  // 设置canvas实际尺寸（像素）= CSS尺寸 * devicePixelRatio
  state.canvas.width = CANVAS_WIDTH * pixelRatio;
  state.canvas.height = CANVAS_HEIGHT * pixelRatio;

  // 缩放上下文以匹配高DPI
  ctx.scale(pixelRatio, pixelRatio);

  // 根据主题填充背景
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

/**
 * 绑定事件
 */
function bindEvents() {
  // 颜色选择
  const palette = document.getElementById('colorPalette');
  palette.addEventListener('click', (e) => {
    if (e.target.classList.contains('color-swatch')) {
      const color = e.target.dataset.color;
      selectColor(color);

      // 更新选中样式
      palette.querySelectorAll('.color-swatch').forEach(el => el.classList.remove('selected'));
      e.target.classList.add('selected');
    }
  });

  // 笔触大小
  const brushSizeInput = document.getElementById('brushSize');
  const brushSizeValue = document.getElementById('brushSizeValue');
  brushSizeInput.addEventListener('input', (e) => {
    state.brushSize = parseInt(e.target.value);
    brushSizeValue.textContent = state.brushSize;
  });

  // 清空按钮
  document.getElementById('clearBtn').addEventListener('click', clearCanvas);

  // 保存按钮
  document.getElementById('saveBtn').addEventListener('click', saveCanvas);

  // 绘画事件
  state.canvas.addEventListener('mousedown', startDrawing);
  state.canvas.addEventListener('mousemove', draw);
  state.canvas.addEventListener('mouseup', stopDrawing);
  state.canvas.addEventListener('mouseout', stopDrawing);

  // 触摸支持
  state.canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    state.canvas.dispatchEvent(mouseEvent);
  }, { passive: false });

  state.canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    state.canvas.dispatchEvent(mouseEvent);
  }, { passive: false });

  state.canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    state.canvas.dispatchEvent(mouseEvent);
  }, { passive: false });
}

/**
 * 选择颜色
 */
export function selectColor(color) {
  state.currentColor = color;
}

/**
 * 开始绘画
 */
function startDrawing(event) {
  state.isDrawing = true;
  [state.lastX, state.lastY] = getCanvasCoordinates(event);
}

/**
 * 获取相对于 canvas 的坐标
 */
function getCanvasCoordinates(event) {
  const rect = state.canvas.getBoundingClientRect();
  // 由于 ctx 已经按 pixelRatio 缩放，直接使用CSS坐标即可
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return [x, y];
}

/**
 * 绘画过程
 */
function draw(event) {
  if (!state.isDrawing) return;

  const [currentX, currentY] = getCanvasCoordinates(event);

  const ctx = state.ctx;
  ctx.beginPath();
  ctx.moveTo(state.lastX, state.lastY);
  ctx.lineTo(currentX, currentY);
  ctx.strokeStyle = state.currentColor;
  ctx.lineWidth = state.brushSize;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  // 添加柔和扩散效果
  ctx.beginPath();
  ctx.arc(currentX, currentY, state.brushSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = state.currentColor + '80';
  ctx.fill();

  state.lastX = currentX;
  state.lastY = currentY;
}

/**
 * 停止绘画
 */
function stopDrawing() {
  state.isDrawing = false;
}

/**
 * 清空画布
 */
export function clearCanvas() {
  if (confirm('确定要清空画布吗？')) {
    clearCanvasNoConfirm();
    // 清除本地存储
    localStorage.removeItem('moodPaletteDrawing');
  }
}

/**
 * 清空画布不询问
 */
function clearCanvasNoConfirm() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  state.ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
  state.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

/**
 * 保存画布到本地存储
 */
export function saveCanvas() {
  try {
    const dataUrl = state.canvas.toDataURL('image/png');
    localStorage.setItem('moodPaletteDrawing', dataUrl);
    alert('画布已保存到本地！');
  } catch (e) {
    alert('保存失败，请重试');
  }
}

/**
 * 从本地存储加载
 */
function loadCanvas() {
  const saved = localStorage.getItem('moodPaletteDrawing');
  if (saved) {
    const img = new Image();
    img.onload = () => {
      state.ctx.drawImage(img, 0, 0);
    };
    img.src = saved;
  }
}

/**
 * 主题改变时更新画布背景
 */
function updateCanvasBackground() {
  // 只有当画布是空的才更新背景
  // 如果用户已经画了，就不改变背景
  // 这里只在重新填充背景会清除画作，所以只在新建时处理
  if (state.ctx) {
    // 检查是否几乎空白 - 简单策略：如果没有保存就更新
    if (!localStorage.getItem('moodPaletteDrawing')) {
      clearCanvasNoConfirm();
    }
  }
}

/**
 * 获取当前选中颜色（用于测试）
 */
export function getCurrentColor() {
  return state.currentColor;
}

/**
 * 获取笔触大小（用于测试）
 */
export function getBrushSize() {
  return state.brushSize;
}

/**
 * 设置笔触大小（用于测试）
 */
export function setBrushSize(size) {
  state.brushSize = size;
}

/**
 * 销毁游戏，清理资源
 */
export function destroyMoodPalette() {
  document.removeEventListener('themeChanged', updateCanvasBackground);
  if (state.canvas) {
    // 移除所有事件监听器需要重新绑定引用，所以我们清空画布
    if (state.ctx) {
      state.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }
  if (state.container) {
    state.container.innerHTML = '';
  }
  // 清空状态
  state.currentColor = EMOTIONS[0].color;
  state.brushSize = 10;
  state.isDrawing = false;
  state.container = null;
  state.canvas = null;
  state.ctx = null;
  state.lastX = 0;
  state.lastY = 0;
}

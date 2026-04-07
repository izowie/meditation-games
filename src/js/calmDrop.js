/**
 * 游戏3: 平静水滴
 * 点击湖面产生涟漪，引导用户放慢节奏
 */

import { setAnimationFrame } from './card.js';

const MAX_RIPPLES = 8;
const RIPPLE_DURATION = 6000;
const RIPPLE_COUNT_PER_CLICK = 3; // 多层涟漪效果

let state = {
  ripples: [],
  lastClickTime: null,
  container: null,
  animationId: null
};

// DOM 元素
let gameContainer = null;
let infoElement = null;

/**
 * 初始化游戏
 */
export function initCalmDrop(container) {
  state.container = container;
  state.ripples = [];
  state.lastClickTime = null;

  render();
  bindEvents();

  // 添加初始涟漪，让用户一打开就看到效果
  const centerX = gameContainer.offsetWidth / 2;
  const centerY = gameContainer.offsetHeight / 2;
  addRipple(centerX, centerY);

  animate();
}

/**
 * 渲染游戏UI
 */
function render() {
  const html = `
    <div class="calm-drop" id="calmDrop">
      <div class="cdrop-info" id="cdropInfo">点击湖面，放慢节奏</div>
    </div>
  `;

  state.container.innerHTML = html;
  gameContainer = document.getElementById('calmDrop');
  infoElement = document.getElementById('cdropInfo');
}

/**
 * 绑定点击事件
 */
function bindEvents() {
  gameContainer.addEventListener('click', handleClick);
}

/**
 * 处理点击
 */
function handleClick(event) {
  const rect = gameContainer.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // 计算点击间隔
  const now = Date.now();
  let interval = null;
  if (state.lastClickTime) {
    interval = (now - state.lastClickTime) / 1000;
    updateInfo(interval);
  }
  state.lastClickTime = now;

  // 添加多层涟漪，错开一点位置产生更自然的效果
  for (let i = 0; i < RIPPLE_COUNT_PER_CLICK; i++) {
    const offsetX = (Math.random() - 0.5) * 10;
    const offsetY = (Math.random() - 0.5) * 10;
    addRipple(x + offsetX, y + offsetY, i * 150);
  }

  // 如果超过最大数量，移除最早的
  while (state.ripples.length > MAX_RIPPLES * RIPPLE_COUNT_PER_CLICK) {
    const oldest = state.ripples.shift();
    removeRipple(oldest);
  }
}

/**
 * 添加新涟漪
 */
function addRipple(x, y, delay = 0) {
  const ripple = {
    x,
    y,
    startTime: Date.now() - delay,
    maxRadius: Math.max(
      x, gameContainer.offsetWidth - x,
      y, gameContainer.offsetHeight - y
    ) * 0.8 + 50,
    element: null
  };

  const el = document.createElement('div');
  el.className = 'cdrop-ripple';
  // 随机线宽，让多层涟漪看起来更自然
  const width = 2 + Math.random() * 3;
  el.style.borderWidth = `${width}px`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  gameContainer.appendChild(el);

  ripple.element = el;
  state.ripples.push(ripple);

  return ripple;
}

/**
 * 移除涟漪
 */
function removeRipple(ripple) {
  if (ripple.element && ripple.element.parentNode) {
    ripple.element.parentNode.removeChild(ripple.element);
  }
}

/**
 * 更新提示信息
 */
function updateInfo(interval) {
  const message = getIntervalMessage(interval);
  infoElement.textContent = `上次间隔: ${interval.toFixed(1)}秒 · ${message}`;
}

/**
 * 根据间隔获取提示信息
 */
export function getIntervalMessage(interval) {
  if (interval < 3) {
    return "再慢一点";
  } else if (interval < 5) {
    return "很好，继续放慢";
  } else {
    return "节奏很好";
  }
}

/**
 * 动画循环
 */
function animate() {
  const now = Date.now();

  state.ripples.forEach(ripple => {
    const elapsed = now - ripple.startTime;
    const progress = Math.min(elapsed / RIPPLE_DURATION, 1);

    const currentRadius = ripple.maxRadius * progress;
    const opacity = 1 - progress;

    ripple.element.style.width = `${currentRadius * 2}px`;
    ripple.element.style.height = `${currentRadius * 2}px`;
    ripple.element.style.opacity = opacity;
  });

  // 移除过期涟漪
  state.ripples = state.ripples.filter(ripple => {
    if (now - ripple.startTime > RIPPLE_DURATION) {
      removeRipple(ripple);
      return false;
    }
    return true;
  });

  // 只在有涟漪时继续动画
  if (state.ripples.length > 0) {
    const id = requestAnimationFrame(animate);
    setAnimationFrame(id);
    state.animationId = id;
  } else {
    state.animationId = null;
  }
}

/**
 * 获取当前涟漪数量（用于测试）
 */
export function getRippleCount() {
  return state.ripples.length;
}

/**
 * 清空所有涟漪（用于测试）
 */
export function clearAllRipples() {
  state.ripples.forEach(removeRipple);
  state.ripples = [];
  state.lastClickTime = null;
}

/**
 * 销毁游戏，清理资源
 */
export function destroyCalmDrop() {
  if (state.animationId) {
    cancelAnimationFrame(state.animationId);
    state.animationId = null;
  }
  state.ripples.forEach(removeRipple);
  state.ripples = [];
  if (gameContainer) {
    gameContainer.removeEventListener('click', handleClick);
  }
  state.container.innerHTML = '';
  state.ripples = [];
  state.lastClickTime = null;
  gameContainer = null;
  infoElement = null;
  state.container = null;
}

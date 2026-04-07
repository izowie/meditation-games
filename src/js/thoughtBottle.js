/**
 * 游戏2: 思绪漂流瓶
 * 用户写下杂念，放入瓶子漂向远方
 */

import { setAnimationFrame } from './card.js';

let state = {
  bottles: [],
  nextId: 1,
  container: null,
  animationId: null
};

// DOM 元素
let gameContainer = null;
let inputModal = null;
let textInput = null;

/**
 * 初始化游戏
 */
export function initThoughtBottle(container) {
  state.container = container;
  state.bottles = [];
  state.nextId = 1;

  render();
  bindEvents();

  // 添加几个示例瓶子，让用户更有感觉
  const examples = [
    '今天压力有点大',
    '有点焦虑...',
    '想要放松一下'
  ];
  examples.forEach(text => {
    setTimeout(() => createBottle(text), 300 + Math.random() * 500);
  });

  startAnimation();
}

/**
 * 渲染游戏UI
 */
function render() {
  const html = `
    <div class="bottle-game" id="bottleGame">
      <div class="water-surface" id="waterSurface"></div>
      <button class="btn add-bottle-btn" id="addBottleBtn">放下思绪</button>
      <div class="bottle-input-modal" id="bottleInputModal">
        <h3>写下你的杂念</h3>
        <textarea placeholder="在这里写下你的烦恼..." maxlength="100"></textarea>
        <div class="bottle-input-buttons">
          <button class="btn btn-secondary" id="cancelBtn">取消</button>
          <button class="btn" id="confirmBtn">放流</button>
        </div>
      </div>
    </div>
  `;

  state.container.innerHTML = html;

  gameContainer = document.getElementById('bottleGame');
  inputModal = document.getElementById('bottleInputModal');
  textInput = inputModal.querySelector('textarea');
}

/**
 * 绑定事件
 */
function bindEvents() {
  const addBtn = document.getElementById('addBottleBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const confirmBtn = document.getElementById('confirmBtn');

  addBtn.addEventListener('click', openInputModal);
  cancelBtn.addEventListener('click', closeInputModal);
  confirmBtn.addEventListener('click', createAndClose);

  gameContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('bottle')) {
      openInputModal();
    }
  });
}

/**
 * 打开输入弹窗
 */
function openInputModal() {
  inputModal.classList.add('show');
  textInput.value = '';
  setTimeout(() => textInput.focus(), 100);
}

/**
 * 关闭输入弹窗
 */
function closeInputModal() {
  inputModal.classList.remove('show');
}

/**
 * 创建瓶子并关闭弹窗
 */
function createAndClose() {
  const text = textInput.value.trim();
  if (text) {
    createBottle(text);
    closeInputModal();
  }
}

/**
 * 创建新瓶子
 */
export function createBottle(text) {
  const id = state.nextId++;
  const y = 30 + Math.random() * 150;
  const speed = 0.5 + Math.random() * 0.8;
  const wobble = (Math.random() - 0.5) * 0.1;

  const bottle = {
    id,
    text,
    x: -50,
    y,
    speed,
    wobble,
    element: null
  };

  // 创建DOM元素
  const el = document.createElement('div');
  el.className = 'bottle';
  el.style.top = `${bottle.y}px`;
  el.style.left = `${bottle.x}px`;

  if (text) {
    const textEl = document.createElement('div');
    textEl.className = 'bottle-text';
    textEl.textContent = text;
    el.appendChild(textEl);
  }

  bottle.element = el;
  gameContainer.querySelector('#waterSurface').appendChild(el);

  state.bottles.push(bottle);
  return bottle;
}

/**
 * 启动动画
 */
function startAnimation() {
  animate();
}

/**
 * 动画更新
 */
function animate() {
  const containerWidth = gameContainer.offsetWidth;
  const toRemove = [];

  state.bottles.forEach(bottle => {
    bottle.x += bottle.speed;

    // 添加更自然的摇晃效果 - 使用双正弦组合产生更有机的运动
    const time = Date.now() / 1000;
    const wobbleOffset = Math.sin(time * bottle.speed) * 6 + Math.sin(time * bottle.speed * 2.7) * 2;
    const rotation = bottle.wobble * 15 + Math.sin(time * bottle.speed * 0.7) * 2;
    bottle.element.style.left = `${bottle.x}px`;
    bottle.element.style.transform = `translateY(${wobbleOffset}px) rotate(${rotation}deg)`;

    // 检查是否漂出屏幕
    if (bottle.x > containerWidth + 50) {
      toRemove.push(bottle);
    }
  });

  // 移除漂出的瓶子并添加水波纹
  toRemove.forEach(bottle => {
    createRipple(bottle.x, bottle.y);
    removeBottle(bottle.id);
  });

  const id = requestAnimationFrame(animate);
  setAnimationFrame(id);
  state.animationId = id;
}

/**
 * 创建消失水波纹
 */
function createRipple(x, y) {
  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  gameContainer.querySelector('#waterSurface').appendChild(ripple);

  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
  }, 2500);
}

/**
 * 移除瓶子
 */
function removeBottle(id) {
  const index = state.bottles.findIndex(b => b.id === id);
  if (index >= 0) {
    const bottle = state.bottles[index];
    if (bottle.element && bottle.element.parentNode) {
      bottle.element.parentNode.removeChild(bottle.element);
    }
    state.bottles.splice(index, 1);
  }
}

/**
 * 获取当前瓶子列表（用于测试）
 */
export function getBottles() {
  return [...state.bottles];
}

/**
 * 清空所有瓶子（用于测试）
 */
export function clearAllBottles() {
  state.bottles.forEach(bottle => {
    if (bottle.element && bottle.element.parentNode) {
      bottle.element.parentNode.removeChild(bottle.element);
    }
  });
  state.bottles = [];
  state.nextId = 1;
}

/**
 * 销毁游戏，清理资源
 */
export function destroyThoughtBottle() {
  if (state.animationId) {
    cancelAnimationFrame(state.animationId);
    state.animationId = null;
  }
  clearAllBottles();
  // 移除所有涟漪
  const ripples = document.querySelectorAll('.ripple');
  ripples.forEach(ripple => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
  });
  if (state.container) {
    state.container.innerHTML = '';
  }
  // 清空引用
  gameContainer = null;
  inputModal = null;
  textInput = null;
  state.container = null;
  state.bottles = [];
  state.nextId = 1;
}

// 导出供测试
export { state };
export function setGameContainer(container) {
  gameContainer = container;
}

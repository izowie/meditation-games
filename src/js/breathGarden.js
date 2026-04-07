/**
 * 游戏1: 呼吸花园
 * 通过引导深呼吸帮助用户放松，每次呼吸种子成长
 */

import { setAnimationFrame } from './card.js';

const PHASES = {
  IDLE: 'idle',
  INHALE: 'inhale',
  HOLD: 'hold',
  EXHALE: 'exhale',
  COMPLETE: 'complete'
};

const TIMINGS = {
  INHALE: 4000,
  HOLD: 4000,
  EXHALE: 6000
};

const TOTAL_CYCLES = 5;

let state = {
  phase: PHASES.IDLE,
  currentCycle: 0,
  growth: 0,
  startTime: 0,
  container: null,
  animationId: null
};

// DOM 元素
let guideText = null;
let outerCircle = null;
let innerCircle = null;
let plant = null;
let gardenContainer = null;
let resetBtn = null;
let plantParts = null;
let seed = null;

/**
 * 初始化游戏
 */
export function initBreathGarden(container) {
  state.container = container;
  render();
  start();
}

/**
 * 渲染游戏UI
 */
function render() {
  const html = `
    <div class="breath-garden">
      <div class="breath-guide" id="breathGuide">点击开始，跟随节奏呼吸</div>
      <div class="breath-circle-container">
        <div class="breath-circle breath-circle-outer" id="outerCircle"></div>
        <div class="breath-circle breath-circle-inner" id="innerCircle"></div>
      </div>
      <div class="plant-container">
        <svg class="plant" id="plant" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
          <!-- 土地 -->
          <path d="M0 180 Q50 170 100 180 L100 200 L0 200 Z" fill="#8b6914"/>
          <!-- 种子/植物 -->
          <g id="plantGrow">
            <circle cx="50" cy="160" r="8" fill="#4a370a" opacity="1"/>
            <!-- 茎会逐渐显示 -->
            <path d="M50 152 L50 120" stroke="#2d882d" stroke-width="4" fill="none" opacity="0" stroke-linecap="round"/>
            <path d="M50 120 L40 100" stroke="#2d882d" stroke-width="3" fill="none" opacity="0" stroke-linecap="round"/>
            <path d="M50 120 L60 90" stroke="#2d882d" stroke-width="3" fill="none" opacity="0" stroke-linecap="round"/>
            <path d="M50 90 L45 70" stroke="#2d882d" stroke-width="3" fill="none" opacity="0" stroke-linecap="round"/>
            <path d="M50 90 L55 60" stroke="#2d882d" stroke-width="3" fill="none" opacity="0" stroke-linecap="round"/>
            <!-- 叶子 -->
            <ellipse cx="35" cy="105" rx="8" ry="12" fill="#4da64d" opacity="0" transform="rotate(-30 35 105)"/>
            <ellipse cx="68" cy="85" rx="8" ry="12" fill="#4da64d" opacity="0" transform="rotate(40 68 85)"/>
            <ellipse cx="35" cy="65" rx="10" ry="14" fill="#4da64d" opacity="0" transform="rotate(-35 35 65)"/>
            <ellipse cx="62" cy="50" rx="10" ry="14" fill="#4da64d" opacity="0" transform="rotate(35 62 50)"/>
            <!-- 花朵 -->
            <g opacity="0" transform="translate(50 35)">
              <circle cx="0" cy="0" r="8" fill="#ffeb3b"/>
              <ellipse cx="-12" cy="0" rx="8" ry="12" fill="#ffb7c5" transform="rotate(-45 -12 0)"/>
              <ellipse cx="12" cy="0" rx="8" ry="12" fill="#ffb7c5" transform="rotate(135 12 0)"/>
              <ellipse cx="0" cy="-12" rx="8" ry="12" fill="#ffb7c5" transform="rotate(45 0 -12)"/>
              <ellipse cx="0" cy="12" rx="8" ry="12" fill="#ffb7c5" transform="rotate(225 0 12)"/>
            </g>
          </g>
        </svg>
      </div>
      <button class="btn" id="resetBtn" style="margin-top: 1rem; display: none;">重新开始</button>
    </div>
  `;

  state.container.innerHTML = html;

  guideText = state.container.querySelector('#breathGuide');
  outerCircle = state.container.querySelector('#outerCircle');
  innerCircle = state.container.querySelector('#innerCircle');
  plant = state.container.querySelector('#plant');
  resetBtn = state.container.querySelector('#resetBtn');
  gardenContainer = state.container.querySelector('.breath-garden');
  plantParts = document.querySelectorAll('#plantGrow > *:not(circle)');
  seed = document.querySelector('#plantGrow circle');

  // 添加平滑过渡
  plantParts.forEach(part => {
    part.style.transition = 'opacity 0.8s ease';
  });

  // 设置初始缩放值
  outerCircle.style.transform = 'scale(0.6)';
  if (innerCircle) {
    innerCircle.style.transform = 'scale(0.8)';
  }

  resetBtn.addEventListener('click', reset);
}

/**
 * 开始呼吸循环
 */
export function start() {
  state.phase = PHASES.INHALE;
  state.currentCycle = 0;
  state.growth = 0;
  state.startTime = Date.now();
  updatePlantGrowth();
  animate();
}

/**
 * 动画更新
 */
function animate() {
  const elapsed = Date.now() - state.startTime;

  switch (state.phase) {
    case PHASES.INHALE:
      if (elapsed < TIMINGS.INHALE) {
        const progress = elapsed / TIMINGS.INHALE;
        const scale = 0.6 + progress * 0.7;
        const innerScale = 0.8 + progress * 0.4;
        outerCircle.style.transform = `scale(${scale})`;
        if (innerCircle) {
          innerCircle.style.transform = `scale(${innerScale})`;
        }
        guideText.textContent = '吸气...';
      } else {
        state.phase = PHASES.HOLD;
        state.startTime = Date.now();
        guideText.textContent = '屏住...';
      }
      break;

    case PHASES.HOLD:
      // 屏气阶段保持大小不变
      outerCircle.style.transform = `scale(1.3)`;
      if (innerCircle) {
        innerCircle.style.transform = `scale(1.2)`;
      }
      if (elapsed >= TIMINGS.HOLD) {
        state.phase = PHASES.EXHALE;
        state.startTime = Date.now();
        guideText.textContent = '呼气...';
      }
      break;

    case PHASES.EXHALE:
      if (elapsed < TIMINGS.EXHALE) {
        const progress = elapsed / TIMINGS.EXHALE;
        const scale = 1.3 - progress * 0.7;
        const innerScale = 1.2 - progress * 0.4;
        outerCircle.style.transform = `scale(${scale})`;
        if (innerCircle) {
          innerCircle.style.transform = `scale(${innerScale})`;
        }
      } else {
        completeCycle();
      }
      break;

    case PHASES.COMPLETE:
      return;
  }

  const id = requestAnimationFrame(animate);
  setAnimationFrame(id);
  state.animationId = id;
}

/**
 * 完成一个呼吸周期
 */
function completeCycle() {
  state.currentCycle++;
  state.growth = state.currentCycle / TOTAL_CYCLES;

  updatePlantGrowth();

  if (state.currentCycle >= TOTAL_CYCLES) {
    completeGame();
  } else {
    state.phase = PHASES.INHALE;
    state.startTime = Date.now();
  }
}

/**
 * 更新植物生长状态
 */
function updatePlantGrowth() {
  const growth = state.growth;

  // 根据成长进度显示不同部分
  plantParts.forEach((part, index) => {
    const threshold = (index + 1) / (plantParts.length + 1);
    part.style.opacity = growth >= threshold ? '1' : '0';
  });

  // 种子淡出
  if (seed && growth > 0.2) {
    seed.style.opacity = 1 - (growth - 0.2) / 0.3;
  }
}

/**
 * 完成游戏
 */
function completeGame() {
  state.phase = PHASES.COMPLETE;
  guideText.textContent = '完成了！深呼吸让你放松 🌷';
  resetBtn.style.display = 'block';

  // 添加花瓣飘落效果
  createPetalFall();
}

/**
 * 创建花瓣飘落特效
 */
function createPetalFall() {
  const container = gardenContainer;
  const petalCount = 25;

  // 随机粉色调
  const pinkHues = ['#ffb7c5', '#ffc8d0', '#ffd1dc', '#faaaaa', '#e8b4bc'];

  for (let i = 0; i < petalCount; i++) {
    setTimeout(() => {
      const petal = document.createElement('div');
      petal.className = 'petal';

      const size = 4 + Math.random() * 12;
      const aspectRatio = 0.6 + Math.random() * 0.8;
      petal.style.width = `${size}px`;
      petal.style.height = `${size * aspectRatio}px`;
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.top = `-20px`;

      // 随机粉色
      const pinkColor = pinkHues[Math.floor(Math.random() * pinkHues.length)];
      petal.style.background = pinkColor;

      // 随机动画参数
      const duration = 4 + Math.random() * 5;
      const delay = Math.random() * 3;
      const rotation = Math.random() * 360;
      petal.style.animation = `fall ${duration}s linear forwards`;
      petal.style.animationDelay = `${delay}s`;
      petal.style.transform = `translateY(-10px) rotate(${rotation}deg)`;

      container.appendChild(petal);

      // 动画结束后移除
      setTimeout(() => {
        if (petal.parentNode) {
          petal.parentNode.removeChild(petal);
        }
      }, (duration + delay + 1) * 1000);
    }, i * 150);
  }
}

/**
 * 重置游戏
 */
function reset() {
  // 移除所有花瓣
  const petals = document.querySelectorAll('.petal');
  petals.forEach(p => p.remove());

  // 重置状态
  state.phase = PHASES.IDLE;
  state.currentCycle = 0;
  state.growth = 0;

  // 重置UI
  outerCircle.style.transform = 'scale(0.8)';
  updatePlantGrowth();
  resetBtn.style.display = 'none';

  // 重新开始
  start();
}

/**
 * 获取当前状态（用于测试）
 */
export function getState() {
  return { ...state };
}

/**
 * 设置状态（用于测试）
 */
export function setState(newState) {
  Object.assign(state, newState);
}

/**
 * 销毁游戏，清理资源
 */
export function destroyBreathGarden() {
  if (state.animationId) {
    cancelAnimationFrame(state.animationId);
    state.animationId = null;
  }
  if (resetBtn) {
    resetBtn.removeEventListener('click', reset);
  }
  // 移除所有花瓣
  const petals = document.querySelectorAll('.petal');
  petals.forEach(p => p.remove());
  if (state.container) {
    state.container.innerHTML = '';
  }
  // 清空缓存引用
  guideText = null;
  outerCircle = null;
  plant = null;
  gardenContainer = null;
  resetBtn = null;
  plantParts = null;
  seed = null;
  // 重置状态
  state.phase = PHASES.IDLE;
  state.currentCycle = 0;
  state.growth = 0;
  state.container = null;
}

// 导出供测试
export { state, PHASES };

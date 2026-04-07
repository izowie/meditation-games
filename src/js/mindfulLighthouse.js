/**
 * 游戏4: 正念灯塔
 * 追随着旋转的光束，训练持续注意力
 */

import { setAnimationFrame } from './card.js';

const TARGET_DURATION = 30000; // 30秒
const BEAM_ANGLE = 60; // 光束宽度（度）
const ROTATION_SPEED_RAD = (360 / 15700) * (Math.PI / 180); // 从CSS动画速度转换为弧度/毫秒

let state = {
  isTracking: false,
  elapsed: 0,
  startTime: 0,
  container: null,
  animationId: null,
  isComplete: false
};

// DOM 元素
let container = null;
let beam = null;
let progressBar = null;
let statusText = null;
let completeScreen = null;

/**
 * 初始化游戏
 */
export function initMindfulLighthouse(containerEl) {
  state.container = containerEl;
  state.angle = 0;
  state.elapsed = 0;
  state.isTracking = false;
  state.isComplete = false;

  render();
  bindEvents();
  animate();
}

/**
 * 渲染游戏UI
 */
function render() {
  const html = `
    <div class="mindful-lighthouse" id="mindfulLighthouse">
      <div class="ml-progress">
        <div class="ml-progress-bar" id="progressBar"></div>
      </div>
      <div class="ml-status" id="statusText">保持光标在光线中 30 秒</div>
      <div class="light-beam" id="lightBeam"></div>
      <div class="lighthouse-top"></div>
      <div class="lighthouse-base"></div>
      <div class="ml-complete" id="completeScreen">
        <div class="ml-complete-text">太棒了！你做到了 🌅</div>
      </div>
    </div>
  `;

  state.container.innerHTML = html;

  container = document.getElementById('mindfulLighthouse');
  beam = document.getElementById('lightBeam');
  progressBar = document.getElementById('progressBar');
  statusText = document.getElementById('statusText');
  completeScreen = document.getElementById('completeScreen');
}

/**
 * 绑定事件
 */
function bindEvents() {
  container.addEventListener('mousemove', handleMouseMove);
  container.addEventListener('touchmove', handleTouchMove, { passive: true });

  // 重新开始点击
  completeScreen.addEventListener('click', restart);
}

/**
 * 处理鼠标移动
 */
function handleMouseMove(event) {
  if (state.isComplete) return;

  const rect = container.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  checkPointerInBeam(x, y);
}

/**
 * 处理触摸移动
 */
function handleTouchMove(event) {
  if (state.isComplete) return;

  const rect = container.getBoundingClientRect();
  const touch = event.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  checkPointerInBeam(x, y);
}

/**
 * 检查指针是否在光束内
 */
function checkPointerInBeam(pointerX, pointerY) {
  // 灯塔位置在底部中央
  const lighthouseX = container.offsetWidth / 2;
  const lighthouseY = container.offsetHeight;

  // 计算点相对于灯塔的角度
  const dx = pointerX - lighthouseX;
  const dy = pointerY - lighthouseY;
  const pointerAngle = Math.atan2(dx, -dy);

  // 归一化角度到 0-2π
  let normalizedAngle = pointerAngle;
  if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

  // 获取当前光束角度从CSS动画
  const currentAngle = getCurrentAngle();

  // 当前光束角度范围
  const beamStart = currentAngle - (BEAM_ANGLE * Math.PI / 180) / 2;
  const beamEnd = currentAngle + (BEAM_ANGLE * Math.PI / 180) / 2;

  // 检查是否在范围内（处理边界环绕）
  let inBeam = false;
  if (beamStart < 0) {
    inBeam = normalizedAngle >= (2 * Math.PI + beamStart) || normalizedAngle <= beamEnd;
  } else if (beamEnd > 2 * Math.PI) {
    inBeam = normalizedAngle <= (beamEnd - 2 * Math.PI) || normalizedAngle >= beamStart;
  } else {
    inBeam = normalizedAngle >= beamStart && normalizedAngle <= beamEnd;
  }

  if (inBeam) {
    if (!state.isTracking) {
      startTracking();
    }
  } else {
    if (state.isTracking) {
      loseTracking();
    }
  }
}

/**
 * 开始追踪计时
 */
function startTracking() {
  state.isTracking = true;
  state.startTime = Date.now() - state.elapsed;
  statusText.textContent = "很好，保持在光线中...";
}

/**
 * 失去追踪
 */
function loseTracking() {
  state.isTracking = false;
  statusText.textContent = "偏离了，回到光线中";
}

/**
 * 更新进度
 */
function updateProgress() {
  if (state.isTracking) {
    state.elapsed = Date.now() - state.startTime;
  }

  const percent = Math.min((state.elapsed / TARGET_DURATION) * 100, 100);
  progressBar.style.width = `${percent}%`;
}

/**
 * 检查是否完成
 */
function checkComplete() {
  if (state.elapsed >= TARGET_DURATION && !state.isComplete) {
    completeGame();
  }
}

/**
 * 完成游戏
 */
function completeGame() {
  state.isComplete = true;
  state.isTracking = false;
  completeScreen.classList.add('show');
  statusText.textContent = "完成！";
}

/**
 * 重新开始
 */
function restart() {
  state.isComplete = false;
  state.elapsed = 0;
  state.isTracking = false;
  completeScreen.classList.remove('show');
  progressBar.style.width = '0%';
  statusText.textContent = "保持光标在光线中 30 秒";
  // 重置CSS动画
  beam.style.animation = 'none';
  // 触发重排后重新启动动画
  void beam.offsetWidth;
  beam.style.animation = 'rotateBeam 15.7s linear infinite';
  animate();
}

/**
 * 获取当前光束角度（从CSS变换计算）
 */
function getCurrentAngle() {
  // 获取当前变换矩阵计算当前角度
  const computedStyle = window.getComputedStyle(beam);
  const transform = computedStyle.transform;
  // matrix(a, b, c, d, e, f) -> 旋转角度 = atan2(b, a)
  if (!transform || transform === 'none') return 0;
  const parts = transform.split('(');
  if (parts.length < 2) return 0;
  const valuesPart = parts[1].split(')')[0];
  if (!valuesPart) return 0;
  const values = valuesPart.split(',').map(Number);
  if (values.length < 2) return 0;
  const a = values[0];
  const b = values[1];
  let angle = Math.atan2(b, a);
  if (angle < 0) angle += 2 * Math.PI;
  return angle;
}

/**
 * 动画循环 - 只处理进度更新和完成检测，光束旋转由CSS动画处理
 */
function animate() {
  // 更新进度
  if (state.isTracking) {
    updateProgress();
    checkComplete();
  } else if (state.elapsed > 0 && !state.isComplete) {
    // 偏离时缓慢减少进度而非立即重置
    state.elapsed -= 16; // 每帧减少16ms
    if (state.elapsed < 0) state.elapsed = 0;
    updateProgress();
    if (state.elapsed === 0) {
      statusText.textContent = "偏离了，回到光线中重新开始";
    } else {
      statusText.textContent = "偏离了，快回到光线中";
    }
  }

  // 只有当未完成时继续动画
  if (!state.isComplete) {
    const id = requestAnimationFrame(animate);
    setAnimationFrame(id);
    state.animationId = id;
  }
}

/**
 * 获取当前进度（用于测试）
 */
export function getCurrentProgress() {
  return {
    elapsed: state.elapsed,
    isComplete: state.isComplete,
    currentAngle: getCurrentAngle()
  };
}

/**
 * 销毁游戏，清理资源
 */
export function destroyMindfulLighthouse() {
  if (state.animationId) {
    cancelAnimationFrame(state.animationId);
    state.animationId = null;
  }
  if (container) {
    container.removeEventListener('mousemove', handleMouseMove);
    container.removeEventListener('touchmove', handleTouchMove);
  }
  if (completeScreen) {
    completeScreen.removeEventListener('click', restart);
  }
  if (beam) {
    beam.style.animation = 'none';
  }
  if (state.container) {
    state.container.innerHTML = '';
  }
  // 清空引用
  container = null;
  beam = null;
  progressBar = null;
  statusText = null;
  completeScreen = null;
  state.container = null;
  state.isTracking = false;
  state.elapsed = 0;
  state.isComplete = false;
}

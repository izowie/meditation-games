/**
 * 游戏卡片模块 - 处理卡片展开/收起逻辑
 */

import { destroyBreathGarden } from './breathGarden.js';
import { destroyThoughtBottle } from './thoughtBottle.js';
import { destroyCalmDrop } from './calmDrop.js';
import { destroyMindfulLighthouse } from './mindfulLighthouse.js';
import { destroyMoodPalette } from './moodPalette.js';

let currentExpandedCard = null;
let animationFrameId = null;

// 销毁注册表
const destroyers = {
  breathGarden: destroyBreathGarden,
  thoughtBottle: destroyThoughtBottle,
  calmDrop: destroyCalmDrop,
  mindfulLighthouse: destroyMindfulLighthouse,
  moodPalette: destroyMoodPalette
};

/**
 * 初始化卡片
 */
export function initCards() {
  const cards = document.querySelectorAll('.game-card');

  cards.forEach(card => {
    const header = card.querySelector('.card-header');
    header.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCard(card);
    });
  });
}

/**
 * 切换卡片展开/收起状态
 */
function toggleCard(card) {
  const isExpanded = card.classList.contains('expanded');

  // 如果点击的是已展开的卡片，收起它
  if (isExpanded) {
    // 销毁当前游戏
    const gameName = card.dataset.game;
    if (gameName && destroyers[gameName]) {
      destroyers[gameName]();
    }
    const content = card.querySelector('.card-content');
    if (content && content.dataset.initialized) {
      delete content.dataset.initialized;
    }
    collapseCard(card);
    currentExpandedCard = null;
    cancelCurrentAnimation();
    return;
  }

  // 收起当前展开的卡片
  if (currentExpandedCard) {
    // 销毁当前游戏
    const gameName = currentExpandedCard.dataset.game;
    if (gameName && destroyers[gameName]) {
      destroyers[gameName]();
    }
    const content = currentExpandedCard.querySelector('.card-content');
    if (content && content.dataset.initialized) {
      delete content.dataset.initialized;
    }
    collapseCard(currentExpandedCard);
    cancelCurrentAnimation();
  }

  // 展开新卡片
  expandCard(card);
  currentExpandedCard = card;

  // 平滑滚动到卡片
  setTimeout(() => {
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

/**
 * 展开卡片
 */
function expandCard(card) {
  card.classList.add('expanded');
  card.setAttribute('aria-expanded', 'true');
}

/**
 * 收起卡片
 */
function collapseCard(card) {
  card.classList.remove('expanded');
  card.setAttribute('aria-expanded', 'false');
}

/**
 * 取消当前动画帧
 */
function cancelCurrentAnimation() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

/**
 * 设置当前动画ID（供游戏模块调用）
 */
export function setAnimationFrame(id) {
  cancelCurrentAnimation();
  animationFrameId = id;
}

/**
 * 获取当前展开的游戏名称
 */
export function getCurrentExpandedGame() {
  if (!currentExpandedCard) return null;
  return currentExpandedCard.dataset.game;
}

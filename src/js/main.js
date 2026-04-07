/**
 * 冥想花园 - 主入口文件
 * 初始化所有游戏模块
 */

import { initCards } from './card.js';
import { initBreathGarden } from './breathGarden.js';
import { initThoughtBottle } from './thoughtBottle.js';
import { initCalmDrop } from './calmDrop.js';
import { initMindfulLighthouse } from './mindfulLighthouse.js';
import { initMoodPalette } from './moodPalette.js';

// 游戏注册表
const games = {
  breathGarden: initBreathGarden,
  thoughtBottle: initThoughtBottle,
  calmDrop: initCalmDrop,
  mindfulLighthouse: initMindfulLighthouse,
  moodPalette: initMoodPalette
};

/**
 * 主题切换功能
 */
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', initialTheme);
  updateThemeToggleButton(initialTheme);

  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeToggleButton(newTheme);

  // 通知所有组件主题已更改
  document.dispatchEvent(new CustomEvent('themeChanged'));
}

function updateThemeToggleButton(theme) {
  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) {
    toggleBtn.textContent = theme === 'light' ? '🌙' : '☀️';
  }
}

/**
 * 初始化应用
 */
function init() {
  // 初始化主题
  initTheme();

  // 初始化卡片交互
  initCards();

  // 为每个游戏卡片初始化对应的游戏
  Object.entries(games).forEach(([gameName, initFn]) => {
    const card = document.querySelector(`.game-card[data-game="${gameName}"]`);
    if (card) {
      const content = card.querySelector('.card-content');

      // 当卡片展开时初始化游戏（支持多次展开/收起）
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.target.classList.contains('expanded')) {
            if (!content.dataset.initialized) {
              initFn(content);
              content.dataset.initialized = 'true';
            }
          }
        });
      });

      // 如果已经展开，直接初始化
      if (card.classList.contains('expanded')) {
        if (!content.dataset.initialized) {
          initFn(content);
          content.dataset.initialized = 'true';
        }
      }
      // 始终保持观察，支持多次展开/收起
      observer.observe(card, { attributes: true, attributeFilter: ['class'] });
    }
  });

  // 支持键盘回车点击卡片
  document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const header = card.querySelector('.card-header');
        header.click();
      }
    });
  });
}

// DOM 加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

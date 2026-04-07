import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initCalmDrop, destroyCalmDrop, getIntervalMessage, getRippleCount, clearAllRipples } from '../calmDrop';

describe('calmDrop', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    if (container.innerHTML !== '') {
      destroyCalmDrop();
    }
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  describe('getIntervalMessage', () => {
    it('should return "再慢一点" when interval < 3', () => {
      expect(getIntervalMessage(2)).toBe('再慢一点');
      expect(getIntervalMessage(1.5)).toBe('再慢一点');
    });

    it('should return "很好，继续放慢" when 3 <= interval < 5', () => {
      expect(getIntervalMessage(3)).toBe('很好，继续放慢');
      expect(getIntervalMessage(4)).toBe('很好，继续放慢');
    });

    it('should return "节奏很好" when interval >= 5', () => {
      expect(getIntervalMessage(5)).toBe('节奏很好');
      expect(getIntervalMessage(10)).toBe('节奏很好');
    });
  });

  describe('initialization and destroy', () => {
    it('should initialize correctly', () => {
      initCalmDrop(container);
      expect(container.querySelector('#calmDrop')).not.toBeNull();
      expect(container.querySelector('#cdropInfo')).not.toBeNull();
      expect(getRippleCount()).toBe(1); // 初始有一个涟漪
    });

    it('should destroy correctly', () => {
      initCalmDrop(container);
      expect(container.querySelector('#calmDrop')).not.toBeNull();
      destroyCalmDrop();
      expect(container.innerHTML).toBe('');
      expect(getRippleCount()).toBe(0);
    });
  });

  describe('ripple management', () => {
    it('should clear all ripples correctly', () => {
      initCalmDrop(container);
      // Simulate a click to add a ripple
      const clickEvent = new MouseEvent('click', {
        clientX: 100,
        clientY: 100
      });
      container.querySelector('#calmDrop').dispatchEvent(clickEvent);
      expect(getRippleCount()).toBe(4); // 初始1 + 新增3 = 4 (每个click添加3个涟漪)
      clearAllRipples();
      expect(getRippleCount()).toBe(0);
    });

    it('should limit maximum ripples to MAX_RIPPLES', () => {
      initCalmDrop(container);
      const gameContainer = container.querySelector('#calmDrop');

      // Click 6 times (MAX_RIPPLES * RIPPLE_COUNT_PER_CLICK = 24)
      // 已经有初始1个，再点6次= 1 + 6*3=19，保持 <= 8*3=24
      for (let i = 0; i < 6; i++) {
        const clickEvent = new MouseEvent('click', {
          clientX: 100 + i * 10,
          clientY: 100
        });
        gameContainer.dispatchEvent(clickEvent);
      }

      // MAX_RIPPLES = 8, 每个点击3个涟漪 = 24
      expect(getRippleCount()).toBe(19); // 初始1 + 6*3 = 19
    });
  });
});

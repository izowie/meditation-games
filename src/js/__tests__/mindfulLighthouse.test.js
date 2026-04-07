import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initMindfulLighthouse, destroyMindfulLighthouse, getCurrentProgress } from '../mindfulLighthouse';

describe('mindfulLighthouse', () => {
  let container;

  beforeEach(() => {
    // 创建一个模拟容器
    container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '400px';
    document.body.appendChild(container);

    // Mock requestAnimationFrame - 只执行一次，不递归调用
    let rafId = 0;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      // 不立即执行 cb 来避免无限递归
      rafId++;
      return rafId;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    destroyMindfulLighthouse();
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  it('should initialize the game correctly', () => {
    initMindfulLighthouse(container);
    expect(container.querySelector('#mindfulLighthouse')).not.toBeNull();
    expect(container.querySelector('#lightBeam')).not.toBeNull();
    expect(container.querySelector('#progressBar')).not.toBeNull();
    expect(container.querySelector('#statusText')).not.toBeNull();
    expect(container.querySelector('#completeScreen')).not.toBeNull();

    const progress = getCurrentProgress();
    expect(progress.elapsed).toBe(0);
    expect(progress.isComplete).toBe(false);
  });

  it('should have correct initial progress state', () => {
    initMindfulLighthouse(container);
    const progress = getCurrentProgress();
    expect(progress.elapsed).toBe(0);
    expect(progress.isComplete).toBe(false);
  });

  it('should destroy the game correctly', () => {
    initMindfulLighthouse(container);
    expect(container.querySelector('#mindfulLighthouse')).not.toBeNull();
    destroyMindfulLighthouse();
    expect(container.innerHTML).toBe('');
  });

  it('should get current angle and handle none transform gracefully', () => {
    initMindfulLighthouse(container);
    // jsdom will return 'none' for transform, so getCurrentAngle should return 0
    const progress = getCurrentProgress();
    expect(typeof progress.currentAngle).toBe('number');
    expect(progress.currentAngle).toBe(0);
  });

  it('should handle restart when completeScreen is clicked', () => {
    initMindfulLighthouse(container);
    const completeScreen = container.querySelector('#completeScreen');
    expect(completeScreen).not.toBeNull();
    // Clicking completeScreen should restart (just verify it doesn't throw)
    expect(() => completeScreen.click()).not.toThrow();
    const progress = getCurrentProgress();
    expect(progress.isComplete).toBe(false);
    expect(progress.elapsed).toBe(0);
  });

  it('should handle mouse moves after initialization', () => {
    initMindfulLighthouse(container);
    const lighthouse = container.querySelector('#mindfulLighthouse');
    // Just verify it doesn't throw when moving mouse
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: 150,
      clientY: 200
    });
    expect(() => lighthouse.dispatchEvent(mouseEvent)).not.toThrow();
  });

  it('should handle touch moves after initialization', () => {
    initMindfulLighthouse(container);
    const lighthouse = container.querySelector('#mindfulLighthouse');
    // Create a mock touch with clientX/Y
    const mockTouch = { clientX: 150, clientY: 200 };
    const touchEvent = new TouchEvent('touchmove', {
      changedTouches: [mockTouch],
      touches: [mockTouch]
    });
    expect(() => lighthouse.dispatchEvent(touchEvent)).not.toThrow();
  });
});

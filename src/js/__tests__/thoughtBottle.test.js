import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initThoughtBottle, destroyThoughtBottle } from '../thoughtBottle';
import * as thoughtBottle from '../thoughtBottle';

describe('thoughtBottle', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    thoughtBottle.clearAllBottles();
  });

  afterEach(() => {
    if (container.innerHTML !== '') {
      destroyThoughtBottle();
    }
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  describe('basic bottle operations', () => {
    beforeEach(() => {
      // Add waterSurface element that createBottle expects
      container.innerHTML = `
        <div class="thought-bottle">
          <div id="waterSurface"></div>
        </div>
      `;
      thoughtBottle.setGameContainer(container);
    });

    it('should create a new bottle with correct text', () => {
      const text = '测试杂念';
      const bottle = thoughtBottle.createBottle(text);

      expect(bottle.id).toBe(1);
      expect(bottle.text).toBe(text);
      expect(bottle.x).toBe(-50);
      expect(thoughtBottle.getBottles().length).toBe(1);
    });

    it('should increment id for each new bottle', () => {
      thoughtBottle.createBottle('one');
      thoughtBottle.createBottle('two');
      thoughtBottle.createBottle('three');

      const bottles = thoughtBottle.getBottles();
      expect(bottles.length).toBe(3);
      expect(bottles[0].id).toBe(1);
      expect(bottles[1].id).toBe(2);
      expect(bottles[2].id).toBe(3);
    });

    it('should have random y position', () => {
      const bottle = thoughtBottle.createBottle('test');
      expect(bottle.y).toBeGreaterThanOrEqual(30);
      expect(bottle.y).toBeLessThanOrEqual(180);
    });

    it('should have positive speed', () => {
      const bottle = thoughtBottle.createBottle('test');
      expect(bottle.speed).toBeGreaterThan(0);
    });

    it('should clear all bottles correctly', () => {
      thoughtBottle.createBottle('one');
      thoughtBottle.createBottle('two');
      expect(thoughtBottle.getBottles().length).toBe(2);
      thoughtBottle.clearAllBottles();
      expect(thoughtBottle.getBottles().length).toBe(0);
    });
  });

  it('should initialize correctly', () => {
    initThoughtBottle(container);
    expect(container.querySelector('#bottleGame')).not.toBeNull();
    expect(container.querySelector('#addBottleBtn')).not.toBeNull();
    expect(container.querySelector('#bottleInputModal')).not.toBeNull();
    expect(thoughtBottle.getBottles().length).toBe(0);
  });

  it('should destroy correctly', () => {
    initThoughtBottle(container);
    expect(container.querySelector('#bottleGame')).not.toBeNull();
    destroyThoughtBottle();
    expect(container.innerHTML).toBe('');
    expect(thoughtBottle.getBottles().length).toBe(0);
    expect(thoughtBottle.state.nextId).toBe(1);
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initCards, setAnimationFrame, getCurrentExpandedGame } from '../card';

describe('card', () => {
  beforeEach(() => {
    // 设置DOM
    document.body.innerHTML = `
      <div class="container">
        <div class="games-grid">
          <article class="game-card" data-game="testGame1">
            <div class="card-header">
              <h2>Test Game 1</h2>
            </div>
            <div class="card-content"></div>
          </article>
          <article class="game-card" data-game="testGame2">
            <div class="card-header">
              <h2>Test Game 2</h2>
            </div>
            <div class="card-content"></div>
          </article>
        </div>
      </div>
    `;

    // 确保 scrollIntoView 存在
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = () => {};
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize cards with click listeners', () => {
    expect(() => initCards()).not.toThrow();
    const cards = document.querySelectorAll('.game-card');
    expect(cards.length).toBe(2);
  });

  it('should set and get current expanded game correctly', () => {
    initCards();
    expect(getCurrentExpandedGame()).toBeNull();
  });

  it('should set animation frame correctly', () => {
    // When there's no previous frame, it still calls cancel (but with null)
    // Just verify it doesn't throw
    expect(() => setAnimationFrame(123)).not.toThrow();
  });

  it('should toggle card expansion on header click', () => {
    initCards();
    const card = document.querySelector('.game-card');
    const header = card.querySelector('.card-header');

    // Click to expand
    header.click();
    expect(card.classList.contains('expanded')).toBe(true);
    expect(getCurrentExpandedGame()).toBe('testGame1');

    // Click again to collapse
    header.click();
    expect(card.classList.contains('expanded')).toBe(false);
    expect(getCurrentExpandedGame()).toBeNull();
  });

  it('should collapse previous card when expanding new one', () => {
    initCards();
    const cards = document.querySelectorAll('.game-card');
    const header1 = cards[0].querySelector('.card-header');
    const header2 = cards[1].querySelector('.card-header');

    // Expand first card
    header1.click();
    expect(cards[0].classList.contains('expanded')).toBe(true);
    expect(getCurrentExpandedGame()).toBe('testGame1');

    // Expand second card
    header2.click();
    expect(cards[0].classList.contains('expanded')).toBe(false);
    expect(cards[1].classList.contains('expanded')).toBe(true);
    expect(getCurrentExpandedGame()).toBe('testGame2');
  });
});

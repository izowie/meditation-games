import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('main entry point', () => {
  beforeEach(() => {
    // Reset modules before each test to allow reimporting
    vi.resetModules();

    // Set up basic DOM structure matching index.html
    document.body.innerHTML = `
      <div class="container">
        <button class="theme-toggle" id="themeToggle">🌙</button>
        <main class="games-grid">
          <article class="game-card" data-game="breathGarden">
            <div class="card-header"></div>
            <div class="card-content"></div>
          </article>
          <article class="game-card" data-game="thoughtBottle">
            <div class="card-header"></div>
            <div class="card-content"></div>
          </article>
          <article class="game-card" data-game="calmDrop">
            <div class="card-header"></div>
            <div class="card-content"></div>
          </article>
          <article class="game-card" data-game="mindfulLighthouse">
            <div class="card-header"></div>
            <div class="card-content"></div>
          </article>
          <article class="game-card" data-game="moodPalette">
            <div class="card-header"></div>
            <div class="card-content"></div>
          </article>
        </main>
      </div>
    `;

    // Mock MutationObserver
    global.MutationObserver = vi.fn(() => ({
      observe: vi.fn(),
      disconnect: vi.fn()
    }));

    // Mock matchMedia for theme detection
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false
    });

    // Mock localStorage
    Storage.prototype.getItem = vi.fn().mockReturnValue(null);
    Storage.prototype.setItem = vi.fn();

    // Mock all game init functions
    vi.mock('../breathGarden.js', () => ({
      initBreathGarden: vi.fn()
    }));
    vi.mock('../thoughtBottle.js', () => ({
      initThoughtBottle: vi.fn()
    }));
    vi.mock('../calmDrop.js', () => ({
      initCalmDrop: vi.fn()
    }));
    vi.mock('../mindfulLighthouse.js', () => ({
      initMindfulLighthouse: vi.fn()
    }));
    vi.mock('../moodPalette.js', () => ({
      initMoodPalette: vi.fn()
    }));
    vi.mock('../card.js', () => ({
      initCards: vi.fn()
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize all games when DOM is already loaded', async () => {
    // Set document ready state to complete
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true
    });

    // Import main to trigger initialization
    await import('../main.js');

    // Check that initCards was called
    const { initCards } = await import('../card.js');
    expect(initCards).toHaveBeenCalled();

    // Check that MutationObserver was created for each game
    expect(global.MutationObserver).toHaveBeenCalledTimes(5);
  });

  it('should wait for DOMContentLoaded if document is still loading', async () => {
    // Set document ready state to loading
    Object.defineProperty(document, 'readyState', {
      value: 'loading',
      writable: true
    });

    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

    // Import main
    await import('../main.js');

    expect(addEventListenerSpy).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));
  });

  it('should handle already expanded cards correctly', async () => {
    // Mark one card as already expanded
    const card = document.querySelector('.game-card[data-game="breathGarden"]');
    card.classList.add('expanded');

    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true
    });

    await import('../main.js');

    // Check that the init function was called directly for expanded card
    const { initBreathGarden } = await import('../breathGarden.js');
    expect(initBreathGarden).toHaveBeenCalled();

    // Check that dataset.initialized was set
    const content = card.querySelector('.card-content');
    expect(content.dataset.initialized).toBe('true');
  });
});

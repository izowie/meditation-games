import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initBreathGarden, destroyBreathGarden, getState, setState, PHASES } from '../breathGarden';

describe('breathGarden', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    setState({
      phase: 'idle',
      currentCycle: 0,
      growth: 0,
      startTime: 0
    });
  });

  afterEach(() => {
    destroyBreathGarden();
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  it('should start with idle state', () => {
    const state = getState();
    expect(state.phase).toBe(PHASES.IDLE);
    expect(state.currentCycle).toBe(0);
    expect(state.growth).toBe(0);
  });

  it('should initialize the game correctly', () => {
    initBreathGarden(container);
    expect(container.querySelector('.breath-garden')).not.toBeNull();
    expect(container.querySelector('#breathGuide')).not.toBeNull();
    expect(container.querySelector('#outerCircle')).not.toBeNull();
    expect(container.querySelector('#plant')).not.toBeNull();
    expect(container.querySelector('#resetBtn')).not.toBeNull();
  });

  it('should destroy the game correctly', () => {
    initBreathGarden(container);
    expect(container.querySelector('.breath-garden')).not.toBeNull();
    destroyBreathGarden();
    expect(container.innerHTML).toBe('');
    const state = getState();
    expect(state.phase).toBe(PHASES.IDLE);
    expect(state.currentCycle).toBe(0);
    expect(state.growth).toBe(0);
  });

  it('should correctly update state via setState', () => {
    setState({
      phase: PHASES.INHALE,
      currentCycle: 2,
      growth: 40
    });
    const state = getState();
    expect(state.phase).toBe(PHASES.INHALE);
    expect(state.currentCycle).toBe(2);
    expect(state.growth).toBe(40);
  });

  it('should transition through phases correctly when setting state', () => {
    setState({ phase: PHASES.INHALE });
    expect(getState().phase).toBe(PHASES.INHALE);
    setState({ phase: PHASES.HOLD });
    expect(getState().phase).toBe(PHASES.HOLD);
    setState({ phase: PHASES.EXHALE });
    expect(getState().phase).toBe(PHASES.EXHALE);
    setState({ phase: PHASES.COMPLETE });
    expect(getState().phase).toBe(PHASES.COMPLETE);
  });

  it('should handle reset when game is complete', () => {
    initBreathGarden(container);
    // Set to complete state
    setState({
      phase: PHASES.COMPLETE,
      currentCycle: 5,
      growth: 100
    });
    // Clicking reset shouldn't throw
    const resetBtn = container.querySelector('#resetBtn');
    expect(resetBtn).not.toBeNull();
    expect(() => resetBtn.click()).not.toThrow();
    // After reset starts breathing, currentCycle is reset to 0
    expect(getState().currentCycle).toBe(0);
    expect(getState().growth).toBe(0);
    // Reset calls start() which goes to inhale phase, not idle
    expect(getState().phase).not.toBe(PHASES.COMPLETE);
  });
});

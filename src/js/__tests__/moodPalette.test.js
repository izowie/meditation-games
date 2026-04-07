import { describe, it, expect, beforeEach, beforeAll, afterAll, afterEach, vi } from 'vitest';
import {
  initMoodPalette,
  destroyMoodPalette,
  selectColor,
  getCurrentColor,
  setBrushSize,
  getBrushSize,
  clearCanvas,
  saveCanvas,
  loadCanvas
} from '../moodPalette';

describe('moodPalette', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    destroyMoodPalette();
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  describe('color selection', () => {
    it('should select the correct color', () => {
      const testColor = '#ff0000';
      selectColor(testColor);
      expect(getCurrentColor()).toBe(testColor);
    });
  });

  describe('brush size', () => {
    it('should get and set brush size correctly', () => {
      setBrushSize(15);
      expect(getBrushSize()).toBe(15);

      setBrushSize(5);
      expect(getBrushSize()).toBe(5);

      setBrushSize(30);
      expect(getBrushSize()).toBe(30);
    });
  });

  describe('initialization and destroy', () => {
    beforeAll(() => {
      // Mock canvas getContext
      HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
        scale: vi.fn(),
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        lineWidth: 0,
        fillStyle: '',
        strokeStyle: '',
        globalCompositeOperation: ''
      }));
      // Mock localStorage
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    });

    it('should initialize correctly', () => {
      initMoodPalette(container);
      expect(container.querySelector('.mood-palette')).not.toBeNull();
      expect(container.querySelector('#moodCanvas')).not.toBeNull();
      expect(container.querySelector('#colorPalette')).not.toBeNull();
      expect(container.querySelectorAll('.color-swatch').length).toBeGreaterThan(0);
      expect(container.querySelector('#brushSize')).not.toBeNull();
    });

    it('should destroy correctly', () => {
      initMoodPalette(container);
      expect(container.querySelector('.mood-palette')).not.toBeNull();
      destroyMoodPalette();
      expect(container.innerHTML).toBe('');

      // After destroy, check that state is reset to defaults
      // Default brush size should be 10
      expect(getBrushSize()).toBe(10);
    });
  });

  describe('canvas operations', () => {
    let mockClearRect;
    let mockFillRect;
    let mockGetItem;
    let mockSetItem;
    let mockRemoveItem;

    beforeEach(() => {
      mockClearRect = vi.fn();
      mockFillRect = vi.fn();
      mockGetItem = vi.fn().mockReturnValue(null);
      mockSetItem = vi.fn();
      mockRemoveItem = vi.fn();

      Storage.prototype.getItem = mockGetItem;
      Storage.prototype.setItem = mockSetItem;
      Storage.prototype.removeItem = mockRemoveItem;

      HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
        scale: vi.fn(),
        clearRect: mockClearRect,
        fillRect: mockFillRect,
        fillStyle: '',
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        arc: vi.fn(),
        stroke: vi.fn(),
        lineWidth: 0,
        fillStyle: '',
        strokeStyle: '',
        lineCap: '',
        lineJoin: '',
        globalCompositeOperation: '',
        fill: vi.fn()
      }));

      HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,fake');

      window.confirm = vi.fn().mockReturnValue(true);
      window.alert = vi.fn();
    });

    it('should handle clearCanvas when confirmed', () => {
      initMoodPalette(container);
      clearCanvas();
      expect(mockFillRect).toHaveBeenCalled();
      expect(mockRemoveItem).toHaveBeenCalledWith('moodPaletteDrawing');
    });

    it('should not clear canvas when confirm is canceled', () => {
      window.confirm.mockReturnValue(false);
      initMoodPalette(container);
      const callsBefore = mockFillRect.mock.calls.length;
      clearCanvas();
      // Should not add any additional calls after canceling
      expect(mockFillRect.mock.calls.length).toBe(callsBefore);
    });

    it('should save canvas to localStorage', () => {
      initMoodPalette(container);
      saveCanvas();
      expect(mockSetItem).toHaveBeenCalledWith('moodPaletteDrawing', expect.any(String));
      expect(window.alert).toHaveBeenCalled();
    });

    it('should handle errors when saving canvas', () => {
      HTMLCanvasElement.prototype.toDataURL = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      initMoodPalette(container);
      saveCanvas();
      expect(window.alert).toHaveBeenCalledWith('保存失败，请重试');
    });

    it('should not crash when loading from null localStorage', () => {
      initMoodPalette(container);
      expect(mockGetItem).toHaveBeenCalledWith('moodPaletteDrawing');
      // Should just do nothing without error
    });
  });
});

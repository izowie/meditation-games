# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production to dist/
npm run preview  # Preview production build locally
```

### Testing
```bash
npm run test          # Run all tests once
npm run test:watch    # Run tests in watch mode
```

## Project Overview

**冥想花园** - 一个单页静态网站，包含 5 个冥想小游戏，帮助用户放松身心、专注当下。

- **Tech Stack**: Vanilla JavaScript (ES6 modules) + HTML5 + CSS3
- **Build Tool**: Vite
- **Testing**: Vitest with jsdom
- **Deployment**: Static hosting (output to `dist/`)

## Architecture

### Project Structure
```
meditation-games/
├── index.html              # Main HTML entry
├── src/
│   ├── css/
│   │   ├── variables.css   # CSS design tokens (colors, spacing)
│   │   ├── main.css        # Global styles
│   │   └── games.css       # Game card expanded styles
│   └── js/
│       ├── main.js         # Application entry, game registry
│       ├── card.js         # Card expand/collapse logic
│       ├── breathGarden.js      # Breathing exercise game
│       ├── thoughtBottle.js     # Thought release game
│       ├── calmDrop.js          # Calm ripples game
│       ├── mindfulLighthouse.js # Focus training game
│       └── moodPalette.js       # Emotional expression drawing
├── docs/
│   ├── prd.md             # Product requirements
│   └── architecture.md    # Detailed architecture documentation
└── dist/                  # Production build output
```

### Module Pattern

Each game follows the same pattern:
- **`init(container)`**: Initializes the game inside the expanded card container
- **`destroy()`**: Cleans up animations, event listeners when card is collapsed
- Uses internal module state (no global state)
- Animations driven by `requestAnimationFrame`

### Core Architecture Principles

1. **Lazy initialization**: Games are only initialized when card is expanded
2. **Proper cleanup**: Animations and event listeners are cleaned up when collapsed
3. **Single expanded card**: Only one game can be open at a time
4. **CSS variables**: All colors and design tokens in `variables.css` supports light/dark themes
5. **No frameworks**: Pure vanilla JS for minimal bundle size

### Design System

- **Color palette**: Warm, soft tones - peach primary, mint secondary, lavender accent
- **Typography**: Inter + Noto Sans SC from Google Fonts
- **Responsive breakpoints**:
  - `< 768px`: 1 column (mobile)
  - `768px - 1024px`: 2 columns (tablet)
  - `> 1024px`: 3 columns (desktop)

## Adding a New Game

1. Create `src/js/newGame.js` with:
   - `export function initNewGame(container)`
   - `export function destroyNewGame()`
2. Add to game registry in `main.js` (import + games object)
3. Add to destroy registry in `card.js`
4. Add card HTML to `index.html` with `data-game="newGame"`
5. Add test file `src/js/__tests__/newGame.test.js`

## Code Guidelines

- ES6 modules for all imports/exports
- camelCase for variables and functions
- Each game is self-contained in a single file
- Animations use `requestAnimationFrame` and must be properly cancelled on destroy
- Follow the warm, calming visual aesthetic - soft colors, rounded corners, gentle transitions

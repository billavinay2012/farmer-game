# Farmer Harvest Game

## Features

- **Multiple Crop Types:** Wheat, pumpkin, and golden apple, each with unique point values and colors.
- **Difficulty Curve:** Crop spawn rate increases and time/goal changes as you progress through 3 levels.
- **Configurable Difficulty:** Crop spawn rates, time limits, and goals are loaded from `difficulty.json`.
- **Level System:** After meeting the goal, the game advances to the next level with more obstacles and higher difficulty.
- **Sprite Animation:** The farmer is animated using a sprite sheet (`sprites/farmer.png`). The animation updates each frame when moving.
- **Modular Code:** Refactored into ES6 modules (`Game.js`, `Farmer.js`, `Crop.js`, `Obstacle.js`).
- **JSDoc Comments:** All classes and methods are documented for clarity.

## How to Run

1. **Start a local web server** in the project directory:
   - With Python 3:
     ```sh
     python3 -m http.server
     ```
   - Or with Node.js:
     ```sh
     npx serve .
     ```
2. **Open your browser** to [http://localhost:8000](http://localhost:8000)
3. **Click Start** to play. Use arrow keys to move, collect crops, and avoid obstacles.

> **Note:** Do not open `index.html` directly; ES6 modules require a server.

## Where Arrow Functions, `this`, and `bind` Are Used

- **Arrow Functions:**
  - Used for the main game loop (`this.tick = (ts) => { ... }`) to preserve the correct `this` context for the `Game` instance.
  - Used in event listeners for UI buttons (e.g., `() => this.start()`) so `this` refers to the `Game` instance.
- **`bind(this)`:**
  - Used in the `Input` class for keyboard event handlers:
    ```js
    this._onKeyDown = this.onKeyDown.bind(this);
    window.addEventListener("keydown", this._onKeyDown);
    ```
    This ensures the handler always has the correct `this` and can be removed later.
- **`this` Context:**
  - In class methods, `this` refers to the instance (e.g., `this.player.handleInput(this.input)` in `Game.update`).
  - In arrow functions, `this` is lexically bound to the surrounding class instance.
  - In event listeners, `bind(this)` is used to ensure `this` refers to the class instance, not the DOM element or window.

## Sprite Sheet
- Place your sprite sheet as `sprites/farmer.png` (4 rows for directions, 4 columns for frames).
- The game will animate the farmer using this image.

## Customizing Difficulty
- Edit `difficulty.json` to change spawn rates, time limits, and goals for each level.

---
Enjoy the game!

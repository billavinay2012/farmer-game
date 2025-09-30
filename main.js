// =========================

/**
 * Boot the Farmer Harvest game using ES6 modules
 */
import { Game } from './Game.js';

// =========================

/**
 * Boot the Farmer Harvest game using ES6 modules
 */
async function startGameWithDifficulty() {
    // Load difficulty settings from external JSON
    let difficulty = null;
    try {
        const resp = await fetch('difficulty.json');
        if (!resp.ok) throw new Error('Failed to load difficulty.json');
        difficulty = await resp.json();
    } catch (e) {
        console.error('Could not load difficulty.json:', e);
    }
    /**
     * @type {HTMLCanvasElement}
     */
    const canvas = document.getElementById("game");
    const game = new Game(canvas, difficulty);
    // Click "Start" in the UI to begin.
}

document.addEventListener('DOMContentLoaded', startGameWithDifficulty);

/**
 * @class Game
 * Main game controller and loop.
 */
import { Farmer } from './Farmer.js';
import { Crop } from './Crop.js';
import { Scarecrow } from './Obstacle.js';

const WIDTH = 900, HEIGHT = 540;
const TILE = 30;
const GAME_LEN = 60;
const GOAL = 15;
const State = Object.freeze({ MENU: "MENU", PLAYING: "PLAYING", PAUSED: "PAUSED", GAME_OVER: "GAME_OVER", WIN: "WIN" });
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const aabb = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export class Game {
    /**
     * @param {HTMLCanvasElement} canvas - The game canvas
     * @param {Object} [difficulty] - Optional difficulty settings loaded from JSON
     */
    constructor(canvas, difficulty) {
        if (!canvas) {
            console.error("Canvas #game not found. Check index.html IDs.");
            return;
        }
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.state = State.MENU;
        this.level = 1;
        this.maxLevel = 3;
        this.difficulty = (difficulty && difficulty.levels) ? difficulty.levels : null;
        this.player = new Farmer(WIDTH / 2 - 17, HEIGHT - 80);
        this.crops = [];
        this.obstacles = [];
        this.lastTime = 0;
        // Use difficulty file if present, else fallback
        if (this.difficulty) {
            this.spawnEvery = this.difficulty[0].spawnEvery;
            this.timeLeft = this.difficulty[0].gameLen;
            this.goal = this.difficulty[0].goal;
        } else {
            this.spawnEvery = 0.8;
            this.timeLeft = GAME_LEN;
            this.goal = GOAL;
        }
        this._accumSpawn = 0;
        this.score = 0;
        this.input = new Input(this);
        this._onResize = this.onResize.bind(this);
        window.addEventListener("resize", this._onResize);
        const get = id => document.getElementById(id) || console.error(`#${id} not found`);
        this.ui = {
            score: get("score"),
            time: get("time"),
            goal: get("goal"),
            status: get("status"),
            start: get("btnStart"),
            reset: get("btnReset"),
            level: get("level"), // Add a UI element for level if present
        };
        if (this.ui.goal) this.ui.goal.textContent = String(this.goal);
        if (this.ui.level) this.ui.level.textContent = `Level ${this.level}`;
        if (this.ui.start) this.ui.start.addEventListener("click", () => this.start());
        if (this.ui.reset) this.ui.reset.addEventListener("click", () => this.reset());
        this.tick = (ts) => {
            const dt = Math.min((ts - this.lastTime) / 1000, 0.033);
            this.lastTime = ts;
            this.update(dt);
            this.render();
            requestAnimationFrame(this.tick);
        };
    }
    /**
     * Handle window resize
     */
    onResize() {}
    /**
     * Start the game
     */
    start() {
        if (this.state === State.MENU || this.state === State.GAME_OVER || this.state === State.WIN) {
            this.reset();
            this.state = State.PLAYING;
            if (this.ui.status) this.ui.status.textContent = "Playing…";
            requestAnimationFrame(this.tick);
        } else if (this.state === State.PAUSED) {
            this.state = State.PLAYING;
            if (this.ui.status) this.ui.status.textContent = "Playing…";
        }
    }
    /**
     * Reset the game state
     */
    /**
     * Reset the game state for the current level
     */
    reset() {
        this.state = State.MENU;
        this.player = new Farmer(WIDTH / 2 - 17, HEIGHT - 80);
        this.crops.length = 0;
        this.obstacles.length = 0;
        this.score = 0;
        // Use difficulty file if present, else fallback
        if (this.difficulty && this.difficulty[this.level - 1]) {
            this.timeLeft = this.difficulty[this.level - 1].gameLen;
            this.spawnEvery = this.difficulty[this.level - 1].spawnEvery;
            this.goal = this.difficulty[this.level - 1].goal;
        } else {
            this.timeLeft = GAME_LEN;
            this.spawnEvery = 0.8;
            this.goal = GOAL;
        }
        this._accumSpawn = 0;
        this.lastTime = performance.now();
        // Add more obstacles for higher levels
        this.obstacles.push(new Scarecrow(200, 220), new Scarecrow(650, 160));
        if (this.level >= 2) this.obstacles.push(new Scarecrow(400, 320));
        if (this.level >= 3) this.obstacles.push(new Scarecrow(800, 100));
        this.syncUI();
        if (this.ui.status) this.ui.status.textContent = "Menu";
    }
    /**
     * Toggle pause state
     */
    togglePause() {
        if (this.state === State.PLAYING) {
            this.state = State.PAUSED;
            if (this.ui.status) this.ui.status.textContent = "Paused";
        } else if (this.state === State.PAUSED) {
            this.state = State.PLAYING;
            if (this.ui.status) this.ui.status.textContent = "Playing…";
        }
    }
    /**
     * Sync UI elements
     */
    /**
     * Sync UI elements
     */
    syncUI() {
        if (this.ui.score) this.ui.score.textContent = String(this.score);
        if (this.ui.time) this.ui.time.textContent = Math.ceil(this.timeLeft);
        if (this.ui.goal) this.ui.goal.textContent = String(this.goal);
        if (this.ui.level) this.ui.level.textContent = `Level ${this.level}`;
    }
    /**
     * Spawn a crop at a random location
     */
    spawnCrop() {
        const gx = Math.floor(Math.random() * ((WIDTH - 2 * TILE) / TILE)) * TILE + TILE;
        const gy = Math.floor(Math.random() * ((HEIGHT - 2 * TILE) / TILE)) * TILE + TILE;
        const r = Math.random();
        let type = "wheat";
        if (r > 0.9) type = "golden_apple";
        else if (r > 0.6) type = "pumpkin";
        this.crops.push(new Crop(gx, gy, type));
    }
    /**
     * Update game state
     * @param {number} dt
     */
    /**
     * Update game state
     * @param {number} dt
     */
    update(dt) {
        if (this.state !== State.PLAYING) return;
        // Use difficulty file if present, else fallback
        let gameLen = GAME_LEN, spawnEvery = 0.8, goal = GOAL;
        if (this.difficulty && this.difficulty[this.level - 1]) {
            gameLen = this.difficulty[this.level - 1].gameLen;
            spawnEvery = this.difficulty[this.level - 1].spawnEvery;
            goal = this.difficulty[this.level - 1].goal;
        }
        this.timeLeft = clamp(this.timeLeft - dt, 0, gameLen);
        this.spawnEvery = spawnEvery;
        this.goal = goal;
        if (this.timeLeft <= 0) {
            if (this.score >= this.goal) {
                // Win: advance to next level or finish game
                if (this.level < this.maxLevel) {
                    this.level++;
                    if (this.ui.status) this.ui.status.textContent = `Level ${this.level} — Get Ready!`;
                    this.reset();
                    setTimeout(() => {
                        this.state = State.PLAYING;
                        if (this.ui.status) this.ui.status.textContent = "Playing…";
                        requestAnimationFrame(this.tick);
                    }, 1200);
                } else {
                    this.state = State.WIN;
                    if (this.ui.status) this.ui.status.textContent = "You Win! All levels complete.";
                }
            } else {
                this.state = State.GAME_OVER;
                if (this.ui.status) this.ui.status.textContent = "Game Over";
            }
            this.syncUI();
            return;
        }
        this.player.handleInput(this.input);
        this.player.update(dt, this);
        this._accumSpawn += dt;
        while (this._accumSpawn >= this.spawnEvery) {
            this._accumSpawn -= this.spawnEvery;
            this.spawnCrop();
        }
        const collected = this.crops.filter(c => aabb(this.player, c));
        if (collected.length) {
            collected.forEach(c => c.dead = true);
            this.score += collected.reduce((sum, c) => sum + (c.points || 1), 0);
            if (this.ui.score) this.ui.score.textContent = String(this.score);
            if (this.score >= this.goal && this.timeLeft > 0) {
                // Early win: advance to next level immediately
                if (this.level < this.maxLevel) {
                    this.level++;
                    if (this.ui.status) this.ui.status.textContent = `Level ${this.level} — Get Ready!`;
                    this.reset();
                    setTimeout(() => {
                        this.state = State.PLAYING;
                        if (this.ui.status) this.ui.status.textContent = "Playing…";
                        requestAnimationFrame(this.tick);
                    }, 1200);
                } else {
                    this.state = State.WIN;
                    if (this.ui.status) this.ui.status.textContent = "You Win! All levels complete.";
                }
                this.syncUI();
                return;
            }
        }
        this.crops = this.crops.filter(c => !c.dead);
        this.crops.forEach(c => c.update(dt, this));
        if (this.ui.time) this.ui.time.textContent = Math.ceil(this.timeLeft);
    }
    /**
     * Render the game
     */
    render() {
        const ctx = this.ctx;
        if (!ctx) return;
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = "#dff0d5";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.strokeStyle = "#c7e0bd";
        ctx.lineWidth = 1;
        for (let y = TILE; y < HEIGHT; y += TILE) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke();
        }
        for (let x = TILE; x < WIDTH; x += TILE) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); ctx.stroke();
        }
        this.crops.forEach(c => c.draw(ctx));
        this.obstacles.forEach(o => o.draw(ctx));
        this.player.draw(ctx);
        ctx.fillStyle = "#333";
        ctx.font = "16px system-ui, sans-serif";
        if (this.state === State.MENU) {
            ctx.fillText("Press Start to play", 20, 28);
        } else if (this.state === State.PAUSED) {
            ctx.fillText("Paused (press P to resume)", 20, 28);
        } else if (this.state === State.GAME_OVER) {
            ctx.fillText("Time up! Press Reset to return to Menu", 20, 28);
        } else if (this.state === State.WIN) {
            ctx.fillText("Harvest complete! Press Reset for another round", 20, 28);
        }
    }
    /**
     * Dispose game resources
     */
    dispose() {
        this.input.dispose();
        window.removeEventListener("resize", this._onResize);
    }
}

/**
 * @class Input
 * Handles keyboard input for the game.
 */
export class Input {
    /**
     * @param {Game} game
     */
    constructor(game) {
        this.game = game;
        this.keys = new Set();
        this._onKeyDown = this.onKeyDown.bind(this);
        this._onKeyUp = this.onKeyUp.bind(this);
        window.addEventListener("keydown", this._onKeyDown);
        window.addEventListener("keyup", this._onKeyUp);
    }
    /**
     * Handle key down event
     * @param {KeyboardEvent} e
     */
    onKeyDown(e) {
        if (e.key === "p" || e.key === "P") this.game.togglePause();
        this.keys.add(e.key);
    }
    /**
     * Handle key up event
     * @param {KeyboardEvent} e
     */
    onKeyUp(e) { this.keys.delete(e.key); }
    /**
     * Remove event listeners
     */
    dispose() {
        window.removeEventListener("keydown", this._onKeyDown);
        window.removeEventListener("keyup", this._onKeyUp);
    }
}

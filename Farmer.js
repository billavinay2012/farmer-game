import { Entity } from './Crop.js';

/**
 * @class Farmer
 * Represents the player character.
 */
class Farmer extends Entity {
    /**
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    constructor(x, y) {
        super(x, y, 34, 34);
        this.speed = 260;
        this.vx = 0; this.vy = 0;
        this.color = "#8b5a2b";
    }
    /**
     * Handle keyboard input
     * @param {Input} input
     */
    handleInput(input) {
        const L = input.keys.has("ArrowLeft"), R = input.keys.has("ArrowRight");
        const U = input.keys.has("ArrowUp"), D = input.keys.has("ArrowDown");
        this.vx = (R - L) * this.speed;
        this.vy = (D - U) * this.speed;
    }
    /**
     * Update farmer position
     * @param {number} dt
     * @param {Game} game
     */
    update(dt, game) {
        const oldX = this.x, oldY = this.y;
        this.x = Math.min(900 - this.w, Math.max(0, this.x + this.vx * dt));
        this.y = Math.min(540 - this.h, Math.max(0, this.y + this.vy * dt));
        const hitObs = game.obstacles.some(o => (this.x < o.x + o.w && this.x + this.w > o.x && this.y < o.y + o.h && this.y + this.h > o.y));
        if (hitObs) { this.x = oldX; this.y = oldY; }
    }
    /**
     * Draw the farmer
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = "#c28e0e";
        ctx.fillRect(this.x + 4, this.y - 6, this.w - 8, 8);
        ctx.fillRect(this.x + 10, this.y - 18, this.w - 20, 12);
    }
}

/**
 * @class AIFarmer
 * Simple AI competitor that moves toward the nearest crop.
 */
class AIFarmer extends Farmer {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        super(x, y);
        this.color = "#3b6ea8"; // Different color for AI
        this.aiScore = 0;
        this.target = null;
    }
    /**
     * AI chooses the nearest crop and moves toward it.
     * @param {number} dt
     * @param {Game} game
     */
    update(dt, game) {
        // Find nearest crop
        if (!game.crops.length) {
            this.vx = 0; this.vy = 0;
            return;
        }
        let minDist = Infinity, nearest = null;
        for (const crop of game.crops) {
            const dx = crop.x - this.x, dy = crop.y - this.y;
            const dist = Math.hypot(dx, dy);
            if (dist < minDist) {
                minDist = dist;
                nearest = crop;
            }
        }
        if (nearest) {
            // Move toward the crop
            const dx = nearest.x - this.x, dy = nearest.y - this.y;
            const mag = Math.hypot(dx, dy) || 1;
            this.vx = (dx / mag) * this.speed;
            this.vy = (dy / mag) * this.speed;
        }
        // Try to move, but block through obstacles
        const oldX = this.x, oldY = this.y;
        this.x = Math.min(900 - this.w, Math.max(0, this.x + this.vx * dt));
        this.y = Math.min(540 - this.h, Math.max(0, this.y + this.vy * dt));
        const hitObs = game.obstacles.some(o => (this.x < o.x + o.w && this.x + this.w > o.x && this.y < o.y + o.h && this.y + this.h > o.y));
        if (hitObs) { this.x = oldX; this.y = oldY; }
    }
    /**
     * Draw the AI farmer
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.85;
        super.draw(ctx);
        ctx.restore();
    }
}

export { Farmer, AIFarmer };

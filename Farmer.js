/**
 * @class Farmer
 * Represents the player character.
 */
import { Entity } from './Crop.js';

export class Farmer extends Entity {
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

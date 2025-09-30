/**
 * @class Scarecrow
 * Represents a static obstacle in the field.
 */
import { Entity } from './Crop.js';

export class Scarecrow extends Entity {
    /**
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    constructor(x, y) { super(x, y, 26, 46); }
    /**
     * Draw the scarecrow
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        const { x, y, w, h } = this;
        ctx.fillStyle = "#9b7653";
        ctx.fillRect(x + w / 2 - 3, y, 6, h);
        ctx.fillStyle = "#c28e0e";
        ctx.beginPath(); ctx.arc(x + w / 2, y + 10, 10, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#6b4f2a"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x, y + 18); ctx.lineTo(x + w, y + 18); ctx.stroke();
    }
}

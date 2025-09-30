/**
 * @class Entity
 * Base class for all game entities.
 */
export class Entity {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    constructor(x, y, w, h) { this.x = x; this.y = y; this.w = w; this.h = h; this.dead = false; }
    /**
     * Update entity
     * @param {number} dt
     * @param {Game} game
     */
    update(dt, game) { }
    /**
     * Draw entity
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) { }
}

/**
 * @class Crop
 * Represents a collectible crop with a type and point value.
 */
export class Crop extends Entity {
    /**
     * Crop types and their point values
     * @type {Array<{type: string, points: number, color: string}>}
     */
    static TYPES = [
        { type: "wheat", points: 1, color: "#d9a441" },
        { type: "pumpkin", points: 3, color: "#ff7f2a" },
        { type: "golden_apple", points: 5, color: "#ffd700" }
    ];

    /**
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} type - Crop type
     */
    constructor(x, y, type = "wheat") {
        super(x, y, 20, 26);
        this.type = type;
        this.sway = Math.random() * Math.PI * 2;
        const def = Crop.TYPES.find(t => t.type === type) || Crop.TYPES[0];
        this.points = def.points;
        this.cropColor = def.color;
    }

    /**
     * Update crop animation
     * @param {number} dt - Delta time
     * @param {Game} game - Game instance
     */
    update(dt, game) { this.sway += dt * 2; }

    /**
     * Draw the crop
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        const { x, y, w, h } = this;
        ctx.strokeStyle = "#2f7d32";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + h);
        ctx.quadraticCurveTo(x + w / 2 + Math.sin(this.sway) * 3, y + h / 2, x + w / 2, y);
        ctx.stroke();
        ctx.fillStyle = this.cropColor;
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        if (this.type === "golden_apple") {
            ctx.strokeStyle = "#bfa600";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x + w / 2, y, 7, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

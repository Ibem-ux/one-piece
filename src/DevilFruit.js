import { removeBackground } from './utils.js';

export class DevilFruit {
    constructor(game, type = 'GOOD') {
        this.game = game;
        this.type = type; // 'GOOD' or 'BAD'
        this.width = 60; // Constant size
        this.height = 60; // Constant size
        this.x = Math.random() * (this.game.width - this.width);
        this.y = -this.height;
        this.speed = 0.3 * (this.game.speedMultiplier || 1); // Same speed as meat
        this.markedForDeletion = false;

        // Good fruits give points, Bad fruits take lives
        this.points = (this.type === 'GOOD') ? 10 : 0;

        this.image = new Image();
        if (this.type === 'BAD') {
            // Randomly select one of the 7 bad fruits
            const badFruitId = Math.floor(Math.random() * 7) + 1; // 1 to 7
            this.image.src = `/badfruit${badFruitId}.png`;
        } else {
            this.image.src = '/devilfruit.png';
        }

        this.imageLoaded = false;

        this.image.onload = () => {
            if (this.image.naturalWidth > 0) {
                // Remove background (auto-detect black or white)
                this.image = removeBackground(this.image, 'auto');
                this.imageLoaded = true;
            }
        };
    }

    update(deltaTime) {
        this.y += this.speed * deltaTime;
        // Deletion logic handled by Game.js
    }

    draw(ctx) {
        if (this.imageLoaded) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // Fallback placeholder
            ctx.fillStyle = (this.type === 'GOOD') ? 'orange' : '#4b0082'; // Orange or Indigo
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

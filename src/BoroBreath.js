import { removeBackground } from './utils.js';

export class BoroBreath {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 80; // Doubled from 40
        this.height = 120; // Doubled from 60
        this.speedY = 5;
        this.speedX = 0; // Horizontal speed for homing
        this.markedForDeletion = false;
        this.parried = false;

        this.image = new Image();
        this.image.src = '/firebreath.png';
        this.imageLoaded = false;
        this.image.onload = () => {
            if (this.image.naturalWidth > 0) {
                // Assuming Fire Breath has black background (common for effects)
                this.image = removeBackground(this.image, 'black');
                this.imageLoaded = true;
            }
        };
    }

    update(deltaTime) {
        if (this.parried) {
            // Homing Logic: Target the Boss
            if (this.game.boss && this.game.boss.active) {
                const bossCenterX = this.game.boss.x + this.game.boss.width / 2;
                const bossCenterY = this.game.boss.y + this.game.boss.height / 2;

                const dx = bossCenterX - (this.x + this.width / 2);
                const dy = bossCenterY - (this.y + this.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 0) {
                    const speed = 15; // Homing Speed
                    this.speedX = (dx / distance) * speed;
                    this.speedY = (dy / distance) * speed;
                }
            } else {
                // Boss dead or gone, just fly up
                this.speedY = -15;
                this.speedX = 0;
            }
        }

        this.x += this.speedX;
        this.y += this.speedY;

        // Cleanup
        if (this.parried && (this.y < -100 || this.y > this.game.height + 100 || this.x < -100 || this.x > this.game.width + 100)) {
            // Keep it alive long enough to hit boss, but clean up if it misses wildly
            this.markedForDeletion = true;
        }
        // If normal, it moves DOWN. Check for bottom bound (Game.js handles collision causes penalty)
        else if (!this.parried && this.y > this.game.height) {
            // Handled in Game.js
        }
    }

    draw(ctx) {
        if (this.imageLoaded) {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

            // Rotate towards movement direction
            if (this.parried) {
                const angle = Math.atan2(this.speedY, this.speedX);
                // Adjust angle because image might point down by default? 
                // Assuming original image points DOWN (positive Y).
                // atan2(0, 1) = 0 (Right). atan2(1, 0) = PI/2 (Down).
                // If image points DOWN, we need to rotate it to match speed direction.
                // Standard rotation: 0 is Right.
                // If Image points DOWN, then "Angle 0" for image is PI/2.
                // So we rotate by (angle - PI/2).
                ctx.rotate(angle - Math.PI / 2);
            } else {
                // Normal fall, pointing down. No rotation needed if image is already vertical.
            }

            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        } else {
            // Draw Fireball/Beam (Fallback)
            const gradient = ctx.createRadialGradient(
                this.x + this.width / 2, this.y + this.height / 2, 5,
                this.x + this.width / 2, this.y + this.height / 2, this.width / 2
            );
            gradient.addColorStop(0, 'yellow');
            gradient.addColorStop(0.5, 'orange');
            gradient.addColorStop(1, 'red');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

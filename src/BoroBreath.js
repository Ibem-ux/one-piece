export class BoroBreath {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.speedY = 5;
        this.markedForDeletion = false;
        this.parried = false;

        this.image = new Image();
        this.image.src = '/breath.png';
        this.imageLoaded = false;
        this.image.onload = () => {
            if (this.image.naturalWidth > 0) this.imageLoaded = true;
        };
    }

    update(deltaTime) {
        this.y += this.speedY;

        // If parried, it moves UP. Check for top bound?
        if (this.parried && this.y < -100) {
            this.markedForDeletion = true;
        }
        // If normal, it moves DOWN. Check for bottom bound (Game.js handles collision, but this is cleanup)
        else if (!this.parried && this.y > this.game.height) {
            // Handled in Game.js for lives penalty
        }
    }

    draw(ctx) {
        if (this.imageLoaded) {
            ctx.save();
            if (this.parried) {
                // Flip vertically if parried? Or just rotate?
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                ctx.rotate(Math.PI); // 180 degrees
                ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
                ctx.restore();
            } else {
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            }
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

import { BoroBreath } from './BoroBreath.js';
import { removeBackground } from './utils.js';

export class Boss {
    constructor(game) {
        this.game = game;
        this.level = 1; // Start level
        this.baseX = this.game.width / 2;
        this.baseY = 0; // Removed top margin
        this.width = (this.game.width / 3) * 1.5; // 1.5x wider (now 1/2 screen width)
        this.height = 200; // Reduced height
        this.x = this.baseX - this.width / 2;
        this.y = -200; // Start off-screen
        this.speedX = 2;
        this.speedY = 0;

        // Fixed 10 HP logic as requested (10 parries)
        this.hp = 10;
        this.maxHp = 10;

        this.active = true;
        this.markedForDeletion = false;

        this.attackTimer = 0;
        this.attackInterval = Math.random() * 2000 + 1000; // Random between 1s-3s

        this.image = new Image();
        this.image.src = '/kaido.png';
        this.imageLoaded = false;

        this.image.onload = () => {
            if (this.image.naturalWidth > 0) {
                // Assuming Kaido has a white background unless specified
                this.image = removeBackground(this.image, 'white');
                this.imageLoaded = true;
            }
        };
    }

    reset(level) {
        this.level = level;
        this.hp = 10; // Reset to 10
        this.maxHp = 10;
        this.x = this.game.width / 2 - this.width / 2;
        this.y = -200; // Drop in
        this.speedY = 5; // Entry speed
        this.active = true;
        this.markedForDeletion = false;
        this.attackTimer = 0;
    }

    update(deltaTime) {
        if (!this.active) return;

        // Entry animation (Drop down to baseY)
        if (this.y < this.baseY && this.speedY > 0) {
            this.y += this.speedY;
            if (this.y >= this.baseY) {
                this.y = this.baseY;
                this.speedY = 0; // Stop vertical movement
            }
        } else {
            // Hover / Recoil logic
            this.y += this.speedY;

            // Gravity purely for recoil recovery
            if (this.y < this.baseY) {
                this.speedY += 0.5; // Gravity
            } else if (this.y > this.baseY) {
                this.y = this.baseY;
                this.speedY = 0;
            }

            // Horizontal Movement
            this.x += this.speedX;
            if (this.x < 0 || this.x > this.game.width - this.width) {
                this.speedX *= -1;
            }

            // Attack Logic (Boro Breath)
            if (this.attackTimer > this.attackInterval) {
                this.attackTimer = 0;
                this.shoot();
                this.attackInterval = Math.random() * 2000 + 1000; // Randomize next interval
            } else {
                this.attackTimer += deltaTime;
            }
        }
    }

    shoot() {
        if (this.game.projectiles) {
            // Center of boss
            const px = this.x + this.width / 2 - 20; // 40 width projectile centered
            const py = this.y + this.height - 20;    // Bottom of boss
            this.game.projectiles.push(new BoroBreath(this.game, px, py));
        }
    }

    draw(ctx) {
        if (!this.active) return;

        // Draw Boss
        if (this.imageLoaded) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // Fallback visuals (Purple Dragon)
            ctx.fillStyle = '#483d8b';
            ctx.beginPath();
            ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 3, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.fillText("KAIDO", this.x + 40, this.y + 80);
        }

        // Draw HP Bar
        this.drawHealthBar(ctx);
    }

    drawHealthBar(ctx) {
        const barWidth = 200;
        const barHeight = 20;
        const barX = (this.game.width - barWidth) / 2;
        const barY = 20;

        // Background
        ctx.fillStyle = 'gray';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Foreground (Red)
        const percent = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = 'red';
        ctx.fillRect(barX, barY, barWidth * percent, barHeight);

        // Border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(`BOSS HP: ${this.hp}/${this.maxHp}`, barX + 50, barY + 16);
    }

    hit() {
        if (this.hp > 0) {
            this.hp--;
            // Recoil: Shoot Up!
            this.speedY = -15;

            if (this.hp <= 0) {
                this.markedForDeletion = true;
                this.active = false;
                // Reward logic handled in Game loop
            }
        }
    }
}

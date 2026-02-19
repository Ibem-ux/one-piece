import { Player } from './Player.js';
import { Meat } from './Meat.js';
import { DevilFruit } from './DevilFruit.js';
import { Boss } from './Boss.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;

        this.updateLivesUI();
        this.lastTime = 0;
        this.player = new Player(this);
        this.items = [];
        this.itemTimer = 0;
        this.itemInterval = 1000;
        this.speedMultiplier = 1; // Difficulty Multiplier

        // Boss System
        this.boss = null;
        this.bossLevel = 0; // 0 = No boss fought yet
        this.bossThresholds = [100, 250, 500, 1000]; // Trigger points
        this.projectiles = []; // Boro Breaths

        // Weather System
        this.weather = 'NONE'; // NONE, WIND, STORM
        this.weatherTimer = 0;
        this.weatherDuration = 10000; // Change weather every 10s
        this.windForce = 0;
    }

    updateLivesUI() {
        const livesEl = document.getElementById('lives');
        if (livesEl) {
            livesEl.innerHTML = '❤️'.repeat(Math.max(0, this.lives));
        }
    }

    start() {
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop(timeStamp) {
        if (this.gameOver) return;

        const deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;

        this.update(deltaTime);
        this.draw();

        if (!this.gameOver) {
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    update(deltaTime) {
        // Weather Logic
        if (this.weatherTimer > this.weatherDuration) {
            this.weatherTimer = 0;
            const r = Math.random();
            if (r < 0.3) {
                this.weather = 'WIND_RIGHT';
                this.windForce = 0.1;
                console.log("Weather: Windy (Right)");
            } else if (r < 0.6) {
                this.weather = 'WIND_LEFT';
                this.windForce = -0.1;
                console.log("Weather: Windy (Left)");
            } else {
                this.weather = 'NONE';
                this.windForce = 0;
                console.log("Weather: Calm");
            }
        } else {
            this.weatherTimer += deltaTime;
        }

        // Apply Weather to Player
        this.player.x += this.windForce * deltaTime;
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x > this.width - this.player.width) this.player.x = this.width - this.player.width;


        this.player.update(deltaTime);

        // --- Boss Logic ---
        // Check for Spawn
        let nextThreshold;
        if (this.bossLevel < this.bossThresholds.length) {
            nextThreshold = this.bossThresholds[this.bossLevel];
        } else {
            // "And so on" logic: Add 1000 for each level beyond the fixed ones
            // Base is 1000 (last fixed).
            // Level 4 -> 2000. Level 5 -> 3000.
            nextThreshold = 1000 + (this.bossLevel - 3) * 1000;
        }

        if (this.score >= nextThreshold && !this.boss) {
            this.boss = new Boss(this);
            this.boss.reset(this.bossLevel + 1);
            console.log(`BOSS SPAWNED! Level ${this.bossLevel + 1} at Score ${this.score} (Threshold: ${nextThreshold})`);
        }

        if (this.boss) {
            this.boss.update(deltaTime);

            // Manage Projectiles (Boro Breath)
            this.projectiles.forEach(p => {
                p.update(deltaTime);

                // 1. Check Player Collision (Parry)
                if (!p.parried && this.checkCollision(this.player, p)) {
                    // PARRY! Deflected back!
                    p.parried = true;
                    p.speedY = -15; // Shoot up fast
                    this.score += 10; // Reduced from 50
                    console.log("Parried! Deflecting back to Boss!");
                }
                // 2. Check Boss Collision (Parried Breath hitting Boss)
                else if (p.parried && this.checkCollision(p, this.boss)) {
                    // Boss Hit!
                    p.markedForDeletion = true;
                    this.boss.hit();
                    console.log("Boss Hit by Parried Breath!");
                }
                // 3. Missed Parry (Hit Ground)
                else if (!p.parried && p.y > this.height) {
                    p.markedForDeletion = true;
                    this.lives--;
                    const livesEl = document.getElementById('lives');
                    if (livesEl) livesEl.innerText = `Lives: ${this.lives}`;

                    if (this.lives <= 0) {
                        this.gameOver = true;
                        document.getElementById('game-over').style.display = 'block';
                    }
                }
            });
            this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);

            // Boss Collision (Body Hit) - Disabled to focus on Parry

            if (this.boss.markedForDeletion) {
                // Boss Defeated!
                const points = 10 * (this.bossLevel + 1); // Significantly reduced to prevent skipping thresholds
                this.score += points;
                this.boss = null;
                this.bossLevel++;
                this.projectiles = [];

                // Increase Difficulty
                this.speedMultiplier += 0.2; // 20% faster
                this.itemInterval = Math.max(200, 1000 - (this.bossLevel * 100)); // Spawn faster
                console.log(`Difficulty Increased! SpeedMult: ${this.speedMultiplier}`);
            }
        }

        // --- Item Logic ---
        // Only spawn items if NO BOSS is active
        if (!this.boss) {
            if (this.itemTimer > this.itemInterval) {
                const r = Math.random();
                if (r < 0.2) { // 20% Good Fruit
                    this.items.push(new DevilFruit(this, 'GOOD'));
                } else if (r < 0.35) { // 15% Bad Fruit (0.2 + 0.15)
                    this.items.push(new DevilFruit(this, 'BAD'));
                } else {
                    this.items.push(new Meat(this));
                }
                this.itemTimer = 0;
            } else {
                this.itemTimer += deltaTime;
            }
        }

        // Item Updating
        this.items.forEach(item => {
            item.update(deltaTime);

            // Check Collision
            if (this.checkCollision(this.player, item)) {
                item.markedForDeletion = true;

                if (item instanceof DevilFruit && item.type === 'BAD') {
                    // Bad Fruit Logic
                    this.lives--;
                    this.updateLivesUI();

                    if (this.lives <= 0) {
                        this.gameOver = true;
                        document.getElementById('game-over').style.display = 'block';
                    }
                    console.log("Ate a Bad Devil Fruit! Lives decreased.");
                } else {
                    // Good Item Logic (Meat or Good Fruit)
                    this.score += item.points;

                    // Transformation Logic (Only for Good Fruits/Meat affecting score thresholds)
                    if (this.score >= 1000 && this.player.gear !== 5) {
                        this.player.setGear(5);
                    } else if (this.score >= 500 && this.score < 1000 && this.player.gear !== 'snakeman') {
                        this.player.setGear('snakeman');
                    } else if (this.score >= 250 && this.score < 500 && this.player.gear !== 4) {
                        this.player.setGear(4);
                    } else if (this.score >= 100 && this.score < 250 && this.player.gear !== 2) {
                        this.player.setGear(2);
                    }

                    // Update score UI
                    const scoreEl = document.getElementById('score');
                    if (scoreEl) scoreEl.innerText = `Score: ${this.score}`;
                }
            }

            // Check Miss (Lives Logic)
            if (!item.markedForDeletion && item.y > this.height) {
                item.markedForDeletion = true;

                // Only lose life if it's a GOOD item (Meat or Good Fruit)
                // If it's a BAD fruit, letting it fall is GOOD.
                let isBadFruit = (item instanceof DevilFruit && item.type === 'BAD');

                if (!isBadFruit) {
                    this.lives--;
                    this.updateLivesUI();

                    if (this.lives <= 0) {
                        this.gameOver = true;
                        document.getElementById('game-over').style.display = 'block';
                    }
                }
            }
        });

        // Remove off-screen or collected items
        this.items = this.items.filter(item => !item.markedForDeletion);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw Player
        this.player.draw(this.ctx);

        // Draw Boss & Projectiles
        if (this.boss) {
            this.boss.draw(this.ctx);
            this.projectiles.forEach(p => p.draw(this.ctx));
        }

        // Draw Items
        this.items.forEach(item => {
            item.draw(this.ctx);
        });

        // Draw debug test
        this.ctx.fillStyle = 'red';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`FPS: ${Math.round(1000 / 60)}`, 10, 580);
    }

    checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.height + rect1.y > rect2.y
        );
    }
}

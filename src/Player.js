export class Player {
    constructor(game) {
        this.game = game;
        this.width = 75;
        this.height = 120;
        this.x = this.game.width / 2 - this.width / 2;
        this.y = this.game.height - this.height - 10;
        this.speed = 0.6; // Pixels per ms
        this.gear = 1; // Default Gear 1

        // Input handling directly in Player for simplicity
        this.keys = new Set();
        window.addEventListener('keydown', (e) => this.keys.add(e.key));
        window.addEventListener('keyup', (e) => this.keys.delete(e.key));

        this.steamParticles = []; // For Gear 2 animation
        this.steamTimer = 0;

        // Load Images
        this.images = {
            base: new Image(),
            gear2: new Image(),
            gear4: new Image(),
            snakeman: new Image(),
            gear5: new Image()
        };
        this.images.base.src = '/luffy.png';
        this.images.gear2.src = '/gear2.png';
        this.images.gear4.src = '/gear4.png';
        this.images.snakeman.src = '/snakeman.png';
        // User provided Gear 5 has a BLACK background
        this.images.gear5.src = '/gear5.png';

        this.imagesLoaded = {
            base: false,
            gear2: false,
            gear4: false,
            snakeman: false,
            gear5: false
        };

        const onImageLoad = (key) => {
            // Check naturalWidth to ensure it's a real image and not an HTML fallback
            if (this.images[key].naturalWidth > 0) {
                console.log(`Image loaded successfully: ${key}`);

                // Process background removal
                if (key === 'gear5') {
                    // Remove BLACK background for Gear 5
                    this.images[key] = this.removeBackground(this.images[key], 'black');
                } else {
                    // Remove WHITE background for others (Base, G2, G4, Snakeman)
                    this.images[key] = this.removeBackground(this.images[key], 'white');
                }

                this.imagesLoaded[key] = true;
            } else {
                console.warn(`Image loaded but invalid (width 0): ${key}`);
                this.imagesLoaded[key] = false;
            }
        };

        const onImageError = (key) => {
            console.warn(`Failed to load image: ${key}`);
            this.imagesLoaded[key] = false;
        };

        // Initialize Loaders
        ['base', 'gear2', 'gear4', 'snakeman', 'gear5'].forEach(key => {
            this.images[key].onload = () => onImageLoad(key);
            this.images[key].onerror = () => onImageError(key);
        });
    }

    setGear(level) {
        if (this.gear !== level) {
            this.gear = level;
            // potential visual effect trigger here
        }
    }

    update(deltaTime) {
        // Move Left
        if (this.keys.has('ArrowLeft') || this.keys.has('a') || this.keys.has('A')) {
            this.x -= this.speed * deltaTime;
        }
        // Move Right
        if (this.keys.has('ArrowRight') || this.keys.has('d') || this.keys.has('D')) {
            this.x += this.speed * deltaTime;
        }

        // Boundary Checks
        if (this.x < 0) this.x = 0;
        if (this.x > this.game.width - this.width) {
            this.x = this.game.width - this.width;
        }

        // Gear 2 Steam Animation
        if (this.gear === 2) {
            if (this.steamTimer > 100) { // Add particle every 100ms
                this.steamParticles.push({
                    x: this.x + Math.random() * this.width,
                    y: this.y + Math.random() * this.height,
                    radius: Math.random() * 5 + 2,
                    alpha: 0.8,
                    speedY: Math.random() * 1 + 0.5
                });
                this.steamTimer = 0;
            } else {
                this.steamTimer += deltaTime;
            }
        }

        // Update particles
        this.steamParticles.forEach(p => {
            p.y -= p.speedY; // Float up
            p.alpha -= 0.02; // Fade out
        });
        this.steamParticles = this.steamParticles.filter(p => p.alpha > 0);
    }

    draw(ctx) {
        // Check for sprites based on gear
        let spriteToUse = null;
        if (this.gear === 5 && this.imagesLoaded.gear5) spriteToUse = this.images.gear5;
        else if (this.gear === 'snakeman' && this.imagesLoaded.snakeman) spriteToUse = this.images.snakeman;
        else if (this.gear === 4 && this.imagesLoaded.gear4) spriteToUse = this.images.gear4;
        else if (this.gear === 2 && this.imagesLoaded.gear2) spriteToUse = this.images.gear2;
        else if (this.gear === 1 && this.imagesLoaded.base) spriteToUse = this.images.base;

        if (spriteToUse) {
            // Draw sprite
            let drawWidth = this.width;
            let drawHeight = this.height;
            let drawX = this.x;
            let drawY = this.y;

            // Optional: Slight adjustment if Gear 4 is too wide for 50px, but user asked for constant.
            // keeping it simple:

            if (this.gear === 5) {
                // Make Gear 5 bigger (1.5x)
                drawWidth = this.width * 1.5;
                drawHeight = this.height * 1.5;
                // Adjust position to center it
                drawX = this.x - (drawWidth - this.width) / 2;
                drawY = this.y - (drawHeight - this.height); // Grow upwards
            }

            ctx.drawImage(spriteToUse, drawX, drawY, drawWidth, drawHeight);

        } else {
            // Fallback to Procedural Drawing
            this.drawProcedural(ctx);
        }

        // Always draw steam for G2 (it overlays or adds to procedural)
        if (this.gear === 2 || this.gear === 4) {
            this.steamParticles.forEach(p => {
                ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }

    drawProcedural(ctx) {
        // ... (truncated for brevity in this replace call, but I need to make sure I don't delete it. 
        // Actually, to avoid deleting drawProcedural, I should only target the draw method's relevant part and the removeBackground method separately.
        // Let's split this into two replacement chunks to be safe and clear.)
        // WAIT, replace_file_content only allows contiguous edits. I must use multi_replace.
        // Or I can just do two separate calls. I will do two separate calls to reduce complexity and risk of error.
        // THIS CALL IS FOR DRAW METHOD ONLY.
    }

    removeBackground(image, colorToRemove = 'white') {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;

        let bgR, bgG, bgB;

        // Determine background color based on request
        if (colorToRemove === 'black') {
            bgR = 0; bgG = 0; bgB = 0;
        } else {
            bgR = 255; bgG = 255; bgB = 255;
        }

        const tolerance = 50;

        const isMatch = (r, g, b) => {
            return Math.abs(r - bgR) < tolerance &&
                Math.abs(g - bgG) < tolerance &&
                Math.abs(b - bgB) < tolerance;
        };

        // Flood Fill Algorithm (Iterative DFS)
        const stack = [];
        const visited = new Uint8Array(width * height);

        // Helper to add to stack
        const tryPush = (x, y) => {
            if (x < 0 || x >= width || y < 0 || y >= height) return;
            const idx = y * width + x;
            if (visited[idx]) return;

            const pixelIndex = idx * 4;
            const r = data[pixelIndex];
            const g = data[pixelIndex + 1];
            const b = data[pixelIndex + 2];

            if (isMatch(r, g, b)) {
                stack.push({ x, y });
                visited[idx] = 1;
            }
        };

        // Start from corners
        tryPush(0, 0);
        tryPush(width - 1, 0);
        tryPush(0, height - 1);
        tryPush(width - 1, height - 1);

        while (stack.length > 0) {
            const { x, y } = stack.pop();
            const idx = (y * width + x) * 4;
            data[idx + 3] = 0; // Turn transparent

            // Neighbors
            tryPush(x + 1, y);
            tryPush(x - 1, y);
            tryPush(x, y + 1);
            tryPush(x, y - 1);
        }

        ctx.putImageData(imageData, 0, 0);
        const newImage = new Image();
        newImage.src = canvas.toDataURL();
        return newImage;
    }
}

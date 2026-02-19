export class Meat {
    constructor(game) {
        this.game = game;
        // Random scale
        const scale = 0.8 + Math.random() * 0.7;
        this.width = 60 * scale;
        this.height = 40 * scale;

        // Points based on size
        this.points = Math.floor(scale * 2);
        if (this.points < 1) this.points = 1;

        this.x = Math.random() * (this.game.width - this.width);
        this.y = -this.height;
        this.speed = 0.3 * (this.game.speedMultiplier || 1);
        this.markedForDeletion = false;

        this.image = new Image();
        this.image.src = '/meat.png';
        this.imageLoaded = false;

        this.image.onload = () => {
            if (this.image.naturalWidth > 0) {
                this.image = this.removeBackground(this.image);
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
            // Fallback placeholder (Red box)
            ctx.fillStyle = 'brown';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    removeBackground(image) {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Loop through pixels
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Remove Black
            if (r < 30 && g < 30 && b < 30) {
                data[i + 3] = 0; // Alpha to 0
            }
        }

        ctx.putImageData(imageData, 0, 0);
        const newImage = new Image();
        newImage.src = canvas.toDataURL();
        return newImage;
    }
}

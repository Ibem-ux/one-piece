export class DevilFruit {
    constructor(game) {
        this.game = game;
        this.width = 50;
        this.height = 50;
        this.x = Math.random() * (this.game.width - this.width);
        this.y = -this.height;
        this.speed = 0.3 * (this.game.speedMultiplier || 1); // Same speed as meat
        this.markedForDeletion = false;
        this.points = 10;

        this.image = new Image();
        this.image.src = '/devilfruit.png';
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
            // Fallback placeholder
            ctx.fillStyle = '#800080'; // Purple
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
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

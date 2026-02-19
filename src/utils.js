
export function removeBackground(image, colorToRemove = 'white', method = 'flood', tolerance = 50) {
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
    if (colorToRemove === 'auto') {
        // Pick the color at (0,0) and use it as the background color
        bgR = data[0];
        bgG = data[1];
        bgB = data[2];
    } else if (colorToRemove === 'black') {
        bgR = 0; bgG = 0; bgB = 0;
    } else {
        bgR = 255; bgG = 255; bgB = 255;
    }

    const isMatch = (r, g, b) => {
        return Math.abs(r - bgR) < tolerance &&
            Math.abs(g - bgG) < tolerance &&
            Math.abs(b - bgB) < tolerance;
    };

    if (method === 'global') {
        // Global Replacement (Scan all pixels)
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            if (isMatch(r, g, b)) {
                data[i + 3] = 0; // Turn transparent
            }
        }
    } else {
        // Flood Fill Algorithm (Iterative DFS) - Default
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
    }

    ctx.putImageData(imageData, 0, 0);
    const newImage = new Image();
    newImage.src = canvas.toDataURL();
    return newImage;
}

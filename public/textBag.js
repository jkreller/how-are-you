class TextBag {
    constructor(initialTexts, spawnPositions) {
        this.texts = []; // Array to store text objects
        this.lastAddedTime = 0; // Track the last time a text was added
        this.initialTexts = initialTexts || []; // Store initial texts
        this.spawnPositions = spawnPositions || [{ x: width / 2, y: height / 2 }]; // Default spawn position if none provided

        // Add all initial texts to the bag
        for (let text of this.initialTexts) {
            this.addText(
                text, // Content
                createVector(random(-1, 1), random(-1, 1)), // Random direction
                random(1, 3), // Random speed
                5000 // Lifespan of 5 seconds
            );
        }
    }

    addText(content, direction, speed, lifespan) {
        const spawnPosition = random(this.spawnPositions); // Randomly select a spawn position

        this.texts.push({
            content: content,
            x: spawnPosition.x,
            y: spawnPosition.y,
            direction: direction,
            speed: speed,
            lifespan: lifespan,
            timeCreated: millis(),
        });
    }

    update() {
        const currentTime = millis();

        // Update positions and remove expired texts
        for (let i = this.texts.length - 1; i >= 0; i--) {
            const textObj = this.texts[i];
            const age = currentTime - textObj.timeCreated;

            // Remove text if it exceeds its lifespan
            if (age > textObj.lifespan) {
                this.texts.splice(i, 1);
                continue;
            }

            // Update position
            textObj.x += textObj.direction.x * textObj.speed;
            textObj.y += textObj.direction.y * textObj.speed;
        }
    }

    display() {
        for (const textObj of this.texts) {
            fill(255);
            textSize(16);
            text(textObj.content, textObj.x, textObj.y);
        }
    }
}
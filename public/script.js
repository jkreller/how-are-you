let video;
let detections = [];
let timer = 0;
let textBags = [];
let scaleX;
let scaleY;
let horizontalOffset;

async function setup() {
    createCanvas(windowWidth, windowHeight);
    video = createCapture(VIDEO);
    video.hide();

    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');

    detectFaces();
}

async function detectFaces() {
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });

    setInterval(async () => {
        detections = await faceapi
            .detectAllFaces(video.elt, options)
            .withFaceLandmarks()
            .withFaceExpressions();
    }, 100);
}

function draw() {
    background(220);

    const aspectRatio = video.width / video.height;
    const videoWidth = height * aspectRatio;

    horizontalOffset = (width - videoWidth) / 2;

    image(video, horizontalOffset, 0, videoWidth, height);

    for (let detection of detections) {
        const { x, y, width: boxW, height: boxH } = detection.detection.box;

        scaleX = videoWidth / video.width;
        scaleY = height / video.height;

        const scaledX = x * scaleX + horizontalOffset;
        const scaledY = y * scaleY;
        const scaledBoxW = boxW * scaleX;
        const scaledBoxH = boxH * scaleY;

        noFill();
        stroke(0, 255, 0);
        strokeWeight(2);
        rect(scaledX, scaledY, scaledBoxW, scaledBoxH);

        /*
        // Draw facial landmarks
        const landmarks = detection.landmarks;
        fill(0, 0, 255);
        noStroke();
        for (let point of landmarks.getLeftEye()) {
            ellipse(point.x * scaleX + horizontalOffset, point.y * scaleY, 4, 4);
        }
        */

        // Get emotions
        const emotions = detection.expressions;
        const [maxEmotion, maxValue] = Object.entries(emotions).reduce(
            (prev, curr) => (curr[1] > prev[1] ? curr : prev)
        );

        // Execute logic every 5 seconds
        if (millis() - timer >= 5000) {
            const leftEyePos = getAveragePoint(detection.landmarks.getLeftEye());
            const rightEyePos = getAveragePoint(detection.landmarks.getRightEye());
            fetchEmotionData(emotions).then((res) => {
                textBags.push(
                    new TextBag(
                        res.words,
                        [leftEyePos, rightEyePos]
                    )
                );
            });

            timer = millis();
        }

        fill(0, 0, 255);
        noStroke();
        for (let textBag of textBags) {
            textBag.update();
            textBag.display();
        }

        // Display the most dominant emotion
        fill(255, 0, 0);
        noStroke();
        textSize(16);
        text(
            `${maxEmotion}: ${(maxValue * 100).toFixed(1)}%`,
            scaledX,
            scaledY - 10
        );
    }
}

async function fetchEmotionData(emotions) {
    try {
        const response = await fetch("/llama", {
            method: 'POST',
            body: JSON.stringify({ emotions: getCurrentEmotions(emotions) }),
            headers: { 'Content-Type': 'application/json' }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching emotion data:", error);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);

    const aspectRatio = video.width / video.height;
    const videoHeight = width / aspectRatio;
    video.size(width, videoHeight);
}

function getCurrentEmotions(emotions, threshold = 0.5) {
    const aboveThreshold = Object.keys(emotions).filter(key => emotions[key] > threshold);

    if (aboveThreshold.length > 0) {
        return aboveThreshold;
    }

    return [Object.keys(emotions).reduce((highest, key) =>
        emotions[key] > emotions[highest] ? key : highest
    )];
}

function getAveragePoint(points) {
    let sumX = 0;
    let sumY = 0;

    for (let point of points) {
        sumX += point.x;
        sumY += point.y;
    }

    let avgX = sumX / points.length;
    let avgY = sumY / points.length;

    return { x: avgX * scaleX + horizontalOffset, y: avgY * scaleY };
}
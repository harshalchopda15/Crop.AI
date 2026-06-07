// ==========================================
// UTILITY: IMAGE TO TENSOR PREPROCESSOR (utils/imageProcessor.js)
// ==========================================
const sharp = require('sharp');

/**
 * Preprocesses an image buffer into a Float32Array tensor for YOLOv8
 * @param {Buffer} imageBuffer - Raw image buffer from Multer
 * @returns {Promise<{tensorData: Float32Array, width: number, height: number}>}
 */
async function preprocessImage(imageBuffer) {
    // 1. Resize image to 640x640 and get raw RGB pixel data
    const { data, info } = await sharp(imageBuffer)
        .resize(640, 640, { fit: 'fill' }) // YOLO expects exact dimensions
        .ensureAlpha(1) // Ensures uniform channel manipulation if needed, but we extract RGB
        .raw()
        .toBuffer({ resolveWithObject: true });

    // 2. Allocate space for the Float32 flat array
    // YOLO format expects planar layout: All Reds, then all Greens, then all Blues (CHW)
    const imageSize = 640 * 640;
    const float32Data = new Float32Array(3 * imageSize);

    // 3. De-interleave and normalize pixel values (0-255 -> 0.0-1.0)
    // Sharp gives us: [R1, G1, B1, A1, R2, G2, B2, A2...]
    // We want: [R1, R2... G1, G2... B1, B2...]
    for (let i = 0; i < imageSize; i++) {
        const rIndex = i * 4;
        const gIndex = i * 4 + 1;
        const bIndex = i * 4 + 2;

        // Channel 0: Red
        float32Data[i] = data[rIndex] / 255.0;
        // Channel 1: Green
        float32Data[imageSize + i] = data[gIndex] / 255.0;
        // Channel 2: Blue
        float32Data[2 * imageSize + i] = data[bIndex] / 255.0;
    }

    return {
        tensorData: float32Data,
        width: info.width,
        height: info.height
    };
}

module.exports = { preprocessImage };
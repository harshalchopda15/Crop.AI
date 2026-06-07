// ==========================================
// UTILITY: YOLOv8 OUTPUT PARSER & NMS (utils/yoloPostProcessor.js)
// ==========================================

/**
 * Parses raw YOLOv8 ONNX output tensor data into readable bounding boxes.
 * @param {Float32Array} outputTensor - Raw float array from ONNX output
 * @param {Array<number>} dims - Dimensions of the tensor [1, 14, 8400]
 * @param {Array<string>} classNames - Array of your 10 tomato classes
 * @param {number} confThreshold - Minimum confidence score to accept (e.g., 0.40)
 * @param {number} iouThreshold - Overlap limit for Non-Maximum Suppression (e.g., 0.45)
 */
function parseYoloOutput(outputTensor, dims, classNames, confThreshold = 0.40, iouThreshold = 0.45) {
    const numRows = dims[1]; // 14 (4 coordinates + 10 classes)
    const numCols = dims[2]; // 8400 (candidate boxes)
    const numClasses = numRows - 4;

    const candidates = [];

    // 1. Loop through all 8400 candidate columns
    for (let col = 0; col < numCols; col++) {
        // Extract confidence scores for all 10 classes for this specific column
        let maxConf = 0;
        let classId = -1;

        for (let cl = 0; cl < numClasses; cl++) {
            const conf = outputTensor[(4 + cl) * numCols + col];
            if (conf > maxConf) {
                maxConf = conf;
                classId = cl;
            }
        }

        // Filter out low-confidence hits early to save CPU processing power
        if (maxConf >= confThreshold) {
            // Extract raw bounding box metrics
            const cx = outputTensor[0 * numCols + col];
            const cy = outputTensor[1 * numCols + col];
            const w = outputTensor[2 * numCols + col];
            const h = outputTensor[3 * numCols + col];

            // Convert from center-point format (cx, cy) to traditional top-left coordinates (x, y)
            const x = cx - w / 2;
            const y = cy - h / 2;

            candidates.push({
                x, y, width: w, height: h,
                confidence: maxConf,
                classId,
                label: classNames[classId]
            });
        }
    }

    // 2. Run Non-Maximum Suppression (NMS) to clean up overlapping duplicate boxes
    return runNMS(candidates, iouThreshold);
}

/**
 * Calculates Intersection over Union (IoU) between two bounding boxes
 */
function calculateIoU(boxA, boxB) {
    const xA = Math.max(boxA.x, boxB.x);
    const yA = Math.max(boxA.y, boxB.y);
    const xB = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
    const yB = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);

    const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
    if (interArea === 0) return 0;

    const boxAArea = boxA.width * boxA.height;
    const boxBArea = boxB.width * boxB.height;

    return interArea / (boxAArea + boxBArea - interArea);
}

/**
 * Eliminates redundant overlapping boxes pointing to the same localized defect
 */
function runNMS(candidates, iouThreshold) {
    // Sort candidates descending by confidence score
    candidates.sort((a, b) => b.confidence - a.confidence);

    const selected = [];
    const suppressed = new Set();

    for (let i = 0; i < candidates.length; i++) {
        if (suppressed.has(i)) continue;

        const baseBox = candidates[i];
        selected.push({
            id: selected.length + 1,
            label: baseBox.label,
            confidence: parseFloat(baseBox.confidence.toFixed(2)),
            // Bound coordinates inside our 640x640 boundaries
            x: Math.max(0, Math.min(640, Math.round(baseBox.x))),
            y: Math.max(0, Math.min(640, Math.round(baseBox.y))),
            width: Math.max(0, Math.min(640, Math.round(baseBox.width))),
            height: Math.max(0, Math.min(640, Math.round(baseBox.height)))
        });

        for (let j = i + 1; j < candidates.length; j++) {
            if (suppressed.has(j)) continue;

            // If an overlapping box has the same classification, check its IoU threshold
            if (candidates[i].classId === candidates[j].classId) {
                const iou = calculateIoU(baseBox, candidates[j]);
                if (iou >= iouThreshold) {
                    suppressed.add(j); // Suppress the weaker duplicate box
                }
            }
        }
    }

    return selected;
}

module.exports = { parseYoloOutput };
// ==========================================
// EXPRESS API SERVER WITH ONNX PIPELINE (server.js)
// ==========================================
const { protect } = require('./middleware/authMiddleware');
const connectDB = require('./config/db');
const DiagnosticLog = require('./models/DiagnosticLog');
const authRoutes = require('./routes/authRoutes');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const ort = require('onnxruntime-node');
const { preprocessImage } = require('./utils/imageProcessor');
const { parseYoloOutput } = require('./utils/yoloPostProcessor');
const analyticsRoutes = require('./routes/analyticsRoutes');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: [
        'http://localhost:5173', 
        'https://crop-8f1oe3xk4-harshalchopda15s-projects.vercel.app' // <-- The exact Vercel URL (NO slash at the end)
    ],
    credentials: true // Keep this if you are using it!
}));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Class names matching your 10-class dataset configuration precisely
const CLASS_NAMES = [
    'Tomato Bacterial Spot', 'Tomato Early blight', 'Tomato Late blight', 
    'Tomato Leaf Mold', 'Tomato Septoria leaf spot', 'Tomato Spider mites Two-spotted spider mite', 
    'Tomato Target Spot', 'Tomato Yellow Leaf Curl Virus', 'Tomato healthy', 'Tomato mosaic virus'
];

let onnxSession = null;

// Load the model once when the server boots up
async function initModel() {
    try {
        console.log('🔄 Loading Crop.AI ONNX Engine...');
        // Once Colab finishes, convert your best.pt to best.onnx and place it here
        onnxSession = await ort.InferenceSession.create('./model/best.onnx');
        console.log('✅ ONNX Model weights loaded successfully into memory.');
    } catch (error) {
        console.warn('⚠️ Could not load best.onnx. Running engine in simulation mode.');
    }
}

// Prediction API Route
app.post('/api/diagnose', protect, upload.single('leaf_image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded.' });
        }

        console.log(`Processing image frame: ${req.file.originalname}`);

        // 1. Run through our structural preprocessing script
        const { tensorData } = await preprocessImage(req.file.buffer);

        // Fallback simulation layout if best.onnx hasn't compiled yet
        if (!onnxSession) {
            return setTimeout(() => {
                res.json({
                    predictions: [{ id: 1, label: 'Tomato Early blight', confidence: 0.89, x: 120, y: 150, width: 230, height: 210 }],
                    message: "Simulation mode active (weights missing)."
                });
            }, 1200);
        }

        // 2. Create input structural multi-dimensional tensor array
        const inputTensor = new ort.Tensor('float32', tensorData, [1, 3, 640, 640]);
        
        // 3. Execute inference execution inside the ONNX environment
        const feeds = {};
        feeds[onnxSession.inputNames[0]] = inputTensor;
        const outputMap = await onnxSession.run(feeds);
        
        const rawOutput = outputMap[onnxSession.outputNames[0]];

        const parsedPredictions = parseYoloOutput(
            rawOutput.data,
            rawOutput.dims,
            CLASS_NAMES,
            0.45,
            0.45
        );

        // 5. SAVE TO MONGODB ATLAS (NEW CODE)
        try {
            const newLog = new DiagnosticLog({
                userId: req.user._id,
                originalFileName: req.file.originalname,
                predictions: parsedPredictions
            });
            await newLog.save();
            console.log(`💾 Log saved to Atlas: ${parsedPredictions.length} threats detected.`);
        } catch (dbError) {
            console.error("Database save failed, but returning AI results anyway:", dbError);
        }

        // Return clean actionable telemetry metrics to the React component canvas
        res.json({
            predictions: parsedPredictions,
            message: "Inference executed successfully."
        });

    } catch (error) {
        console.error("Pipeline Inference Error:", error);
        res.status(500).json({ error: 'Failed to execute diagnostic pipeline.' });
    }
});

// Initialize database connection
connectDB();

app.listen(PORT, async () => {
    console.log(`\n🚀 Crop.AI API running securely on http://localhost:${PORT}`);
    await initModel();
});

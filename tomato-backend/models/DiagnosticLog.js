const mongoose = require('mongoose');

const DiagnosticLogSchema = new mongoose.Schema({
    // In a full production app, this would link to the User who uploaded it
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    originalFileName: { 
        type: String, 
        required: true 
    },
    // We store the array of objects directly from our YOLOv8 parser
    predictions: [{
        label: { type: String, required: true },
        confidence: { type: Number, required: true },
        x: { type: Number },
        y: { type: Number },
        width: { type: Number },
        height: { type: Number }
    }],
    // Automatically stamps the exact time the AI ran the inference
    scannedAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('DiagnosticLog', DiagnosticLogSchema);
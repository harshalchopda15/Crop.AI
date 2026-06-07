const express = require('express');
const router = express.Router();
const DiagnosticLog = require('../models/DiagnosticLog');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/analytics
// @desc    Get user's personalized farm statistics & action schedule
router.get('/', protect, async (req, res) => {
    try {
        // 1. Fetch historical scans from MongoDB
        const logs = await DiagnosticLog.find({ userId: req.user._id }).sort({ scannedAt: -1 });

        const totalScans = logs.length;
        let healthyCount = 0;
        let diseasedCount = 0;

        logs.forEach(log => {
            const isHealthy = log.predictions.some(p => p.label === 'Tomato healthy');
            if (isHealthy && log.predictions.length === 1) healthyCount++;
            else diseasedCount++;
        });

        const healthyPercentage = totalScans === 0 ? 100 : Math.round((healthyCount / totalScans) * 100);
        const threatPercentage = totalScans === 0 ? 0 : Math.round((diseasedCount / totalScans) * 100);

        // ==========================================
        // THE NEW ACTION ENGINE
        // ==========================================
        
        // 2. Fetch live weather for Pune (Lat: 18.52, Lon: 73.85)
        let weather = { humidity: 50, windSpeed: 5 }; // Fallback defaults
        try {
            const weatherResponse = await fetch('https://api.open-meteo.com/v1/forecast?latitude=18.5204&longitude=73.8567&current=relative_humidity_2m,wind_speed_10m');
            if (weatherResponse.ok) {
                const weatherData = await weatherResponse.json();
                weather.humidity = weatherData.current.relative_humidity_2m;
                weather.windSpeed = weatherData.current.wind_speed_10m;
            }
        } catch (err) {
            console.error("Weather fetch failed, using defaults.");
        }

        // 3. Determine Spray Conditions based on actual weather
        let sprayCondition = "OPTIMAL";
        let sprayWarning = "Weather conditions are perfect for chemical application.";
        if (weather.windSpeed > 12 || weather.humidity > 80) {
            sprayCondition = "POOR";
            sprayWarning = `High winds (${weather.windSpeed}km/h) + ${weather.humidity}% humidity. Chemical drift risk is high.`;
        }

        // 4. Generate a Custom Action Schedule based on the Threat
        let latestThreat = null;
        let recommendedAction = "Maintain standard preventative care."; // FIXED: Variable defined here
        
        // Default healthy schedule
        let actionSchedule = [
            { id: 'h1', title: 'Routine Inspection', desc: 'Check lower canopy for pest ingress.', type: 'routine' },
            { id: 'h2', title: 'Soil Moisture Check', desc: 'Ensure deeper root zones are maintaining optimal hydration.', type: 'routine' }
        ];
        
        if (logs.length > 0) {
            const latestLog = logs[0]; 
            const threatPrediction = latestLog.predictions.find(p => p.label !== 'Tomato healthy');
            
            if (threatPrediction) {
                latestThreat = threatPrediction.label;
                
                // Dynamic Rule Engine for Treatment Plans
                if (latestThreat.includes('blight') || latestThreat.includes('Blight')) {
                    recommendedAction = "Apply Copper-based fungicides immediately.";
                    actionSchedule = [
                        { id: 'b1', title: 'Prune Infected Foliage', desc: 'Remove and burn lowest infected leaves immediately.', type: 'immediate' },
                        { id: 'b2', title: 'Fungicide Application', desc: 'Apply Copper-based fungicide or Mancozeb.', type: 'chemical' },
                        { id: 'b3', title: 'Adjust Irrigation', desc: 'Halt overhead watering to keep foliage dry.', type: 'preventative' }
                    ];
                } else if (latestThreat.includes('Virus') || latestThreat.includes('mosaic')) {
                    recommendedAction = "Uproot infected plants to prevent vector transmission.";
                    actionSchedule = [
                        { id: 'v1', title: 'Uproot Target', desc: 'Remove infected plant entirely. Do not compost.', type: 'immediate' },
                        { id: 'v2', title: 'Vector Control', desc: 'Deploy yellow sticky traps for Whiteflies.', type: 'preventative' }
                    ];
                } else if (latestThreat.includes('mites')) {
                    recommendedAction = "Apply Miticide and increase soil moisture.";
                    actionSchedule = [
                        { id: 'm1', title: 'Physical Removal', desc: 'Hose down plants to dislodge mite colonies.', type: 'immediate' },
                        { id: 'm2', title: 'Miticide Spray', desc: 'Apply Abamectin targeting leaf undersides.', type: 'chemical' }
                    ];
                } else {
                    recommendedAction = "Isolate plant and deploy broad-spectrum organic suppression.";
                    actionSchedule = [
                        { id: 'g1', title: 'Isolate Plant', desc: 'Prevent cross-contamination while identifying threat.', type: 'immediate' },
                        { id: 'g2', title: 'Apply Biofungicide', desc: 'Deploy broad-spectrum organic suppression.', type: 'organic' }
                    ];
                }
            }
        }
        
        // ==========================================
        // 5. PROCEDURAL MARKET ENGINE
        // ==========================================
        // Generates realistic fluctuating Mandi prices based on the current date
        const today = new Date();
        const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        
        const basePrice = 3800; 
        const marketHistoryRaw = [];
        
        // Generate 10 days of rolling prices
        for (let i = 9; i >= 0; i--) {
            // Create a pseudo-random wave that changes daily but stays stable on the same day
            const fluctuation = Math.floor(Math.sin(dateSeed - i) * 300) + Math.cos((dateSeed - i) * 0.5) * 150;
            marketHistoryRaw.push(Math.round(basePrice + fluctuation));
        }

        const currentPrice = marketHistoryRaw[9];
        const previousPrice = marketHistoryRaw[8];
        const isTrendingUp = currentPrice >= previousPrice;
        const percentChange = Math.abs(((currentPrice - previousPrice) / previousPrice) * 100).toFixed(1);

        // Convert raw prices to CSS percentages (0% to 100%) for the UI chart
        const minPrice = Math.min(...marketHistoryRaw) - 50;
        const maxPrice = Math.max(...marketHistoryRaw) + 50;
        const chartHeights = marketHistoryRaw.map(price => 
            Math.round(((price - minPrice) / (maxPrice - minPrice)) * 100)
        );

        // 6. Send the massive intelligence payload back to React
        res.json({
            farmName: req.user.farmName,
            totalScans,
            healthyPercentage,
            threatPercentage,
            environment: {
                humidity: weather.humidity,
                windSpeed: weather.windSpeed,
                sprayCondition,
                sprayWarning
            },
            intelligence: {
                activeThreat: latestThreat,
                recommendedAction,
                actionSchedule 
            },
            market: {
                currentPrice,
                isTrendingUp,
                percentChange,
                chartHeights,
                rawPrices: marketHistoryRaw
            }
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ message: 'Server error compiling analytics.' });
    }
});

module.exports = router;
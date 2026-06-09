import React, { useState, useRef, useEffect } from 'react';
import { Upload, ShieldAlert, Sparkles, CheckCircle2, RotateCcw, Cpu, Scan, Lock, X, Mail, User as UserIcon } from 'lucide-react';

const DISEASE_DATABANK = {
  'Tomato healthy': {
    severity: 'None',
    immediate: 'No action required. Plant shows optimal cell structure and coloration.',
    chemical: 'Maintain standard preventative fungicide/insecticide schedule.',
    organic: 'Continue routine compost tea or seaweed extract applications to maintain immunity.',
    prevention: 'Ensure consistent watering and monitor for early signs of pest ingress.'
  },
  'Tomato Yellow Leaf Curl Virus': {
    severity: 'Critical',
    immediate: 'Uproot and safely destroy infected plants immediately. This virus is incurable and spreads rapidly.',
    chemical: 'Apply systemic insecticides to control the Whitefly population (the primary carrier of the virus).',
    organic: 'Set up yellow sticky traps for Whiteflies. Use reflective silver mulches to disorient insects.',
    prevention: 'Plant TYLCV-resistant varieties next season. Use fine-mesh row covers to block Whiteflies.'
  },
  'Tomato Late blight': {
    severity: 'Severe',
    immediate: 'Isolate or prune infected leaves immediately. Burn or bury them away from the field to stop spore travel.',
    chemical: 'Spray Copper-based fungicides or Mancozeb immediately. Repeat every 7-10 days if humidity stays high.',
    organic: 'Apply a spray mixture of baking soda, liquid soap, and water, or use organic Neem Oil extracts.',
    prevention: 'Avoid overhead irrigation. Ensure maximum spacing between plants for airflow.'
  },
  'Tomato Early blight': {
    severity: 'Moderate',
    immediate: 'Prune the lowest infected leaves to prevent spores from splashing higher up the plant during rain.',
    chemical: 'Apply Chlorothalonil or Copper fungicides at the first sign of symptoms.',
    organic: 'Use Bacillus subtilis (a beneficial bacterium) sprays to suppress fungal growth.',
    prevention: 'Mulch the base of the plant to prevent soil-borne spores from splashing onto lower leaves.'
  },
  'Tomato Bacterial Spot': {
    severity: 'Moderate',
    immediate: 'Avoid touching healthy plants after handling infected ones. Do not work in the field when foliage is wet.',
    chemical: 'Apply Copper-based bactericides combined with Mancozeb for increased efficacy.',
    organic: 'Remove severely infected plants. Copper sprays are generally approved for organic use in limited quantities.',
    prevention: 'Use certified disease-free seeds and practice strict crop rotation (do not plant tomatoes in the same soil for 3 years).'
  },
  'Tomato Leaf Mold': {
    severity: 'Moderate',
    immediate: 'Increase ventilation immediately. Prune dense foliage to allow air to circulate freely through the canopy.',
    chemical: 'Apply fungicides containing Chlorothalonil or Difenoconazole if ventilation does not halt the spread.',
    organic: 'Reduce greenhouse/tunnel humidity to below 85%. Potassium bicarbonate sprays can inhibit mold growth.',
    prevention: 'Space plants widely and prune suckers aggressively to maintain an open canopy.'
  },
  'Tomato Septoria leaf spot': {
    severity: 'Moderate',
    immediate: 'Remove and destroy spotted lower leaves. Wash hands and tools thoroughly afterward.',
    chemical: 'Apply preventative Fungicides like Mancozeb or Chlorothalonil on a 7-10 day schedule.',
    organic: 'Use copper fungicides or biofungicides. Completely remove all tomato debris at the end of the season.',
    prevention: 'Water at the base of the plant only (drip irrigation) to keep foliage completely dry.'
  },
  'Tomato Spider mites Two-spotted spider mite': {
    severity: 'Moderate',
    immediate: 'Hose down the plants with a sharp stream of water to physically dislodge the mite colonies.',
    chemical: 'Apply Abamectin or Spiromesifen miticides thoroughly, targeting the undersides of the leaves.',
    organic: 'Introduce predatory mites (Phytoseiulus persimilis) or spray insecticidal soap / horticultural oils.',
    prevention: 'Keep soil adequately moist. Mites thrive and reproduce rapidly in dusty, dry conditions.'
  },
  'Tomato Target Spot': {
    severity: 'Moderate',
    immediate: 'Remove infected leaves to reduce the spore load. Target spot progresses quickly in warm, humid weather.',
    chemical: 'Apply systemic fungicides such as Azoxystrobin or Difenoconazole.',
    organic: 'Improve airflow. Biofungicides containing Bacillus amyloliquefaciens can offer moderate control.',
    prevention: 'Avoid excessive nitrogen fertilization, which creates overly dense, slow-drying canopies.'
  },
  'Tomato mosaic virus': {
    severity: 'Critical',
    immediate: 'Remove and destroy the entire plant and roots. Do not compost it.',
    chemical: 'No chemical cure exists for viral infections. Focus entirely on vector and transmission control.',
    organic: 'Wash hands thoroughly with soap or milk after handling plants, as TMV is highly contagious via touch.',
    prevention: 'Do not smoke tobacco near plants (TMV can transfer from tobacco). Disinfect all pruning tools with a 10% bleach solution.'
  }
};

function Diagnostic({ onRequireAuth }) {
  const [image, setImage] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Auth Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authData, setAuthData] = useState({ farmName: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // ==========================================
  // GATEKEEPER & AUTHENTICATION LOGIC
  // ==========================================
  const handleBoxClick = (e) => {
    const token = localStorage.getItem('token');
    if (!token) {
      e.preventDefault(); 
      onRequireAuth(); // This instantly opens the Auth.jsx modal!
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const response = await fetch(`https://crop-ai-rmsb.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Success! Save the token and close the modal
      localStorage.setItem('token', data.token);
      setShowAuthModal(false);
      setAuthData({ farmName: '', email: '', password: '' }); // Reset form
      
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // ==========================================
  // PIPELINE INFERENCE LOGIC
  // ==========================================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setSelectedDisease(null);
    setPredictions([]);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('leaf_image', file);

    try {
      // 1. THIS IS THE LINE THAT WAS MISSING - Grab the token!
      const token = localStorage.getItem('token'); 

      const response = await fetch('https://crop-ai-rmsb.onrender.com', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` // 2. Send the token
        },
        body: formData, 
      });

      if (!response.ok) throw new Error(`Inference error: ${response.status}`);

      const data = await response.json();
      setPredictions(data.predictions);

    } catch (err) {
      console.error("Transmission Failure:", err);
      alert("Failed to connect to Crop.AI Engine.");
    } finally {
      setLoading(false);
    }
  };
  
  // Canvas drawing logic for glowing bounding boxes
  useEffect(() => {
    if (!image || loading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = image;

    img.onload = () => {
      const displayWidth = Math.min(600, window.innerWidth - 40);
      const scaleFactor = displayWidth / img.width;
      const displayHeight = img.height * scaleFactor;

      canvas.width = displayWidth;
      canvas.height = displayHeight;

      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

      predictions.forEach((box) => {
        const rx = box.x * scaleFactor;
        const ry = box.y * scaleFactor;
        const rw = box.width * scaleFactor;
        const rh = box.height * scaleFactor;

        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#f87171'; 
        ctx.lineWidth = 3;
        
        ctx.strokeRect(rx, ry, rw, rh);
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)'; 
        ctx.font = 'bold 12px "Courier New", monospace'; 
        const textWidth = ctx.measureText(`${box.label} [${Math.round(box.confidence * 100)}%]`).width;
        ctx.fillRect(rx, ry - 24, textWidth + 12, 24);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${box.label} [${Math.round(box.confidence * 100)}%]`, rx + 6, ry - 8);
      });
    };
    imageRef.current = img;
  }, [image, predictions, loading]);

  const handleCanvasClick = (e) => {
    if (predictions.length === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const img = imageRef.current;
    const scaleFactor = canvas.width / img.width;

    const clickedBox = predictions.find((box) => {
      const rx = box.x * scaleFactor;
      const ry = box.y * scaleFactor;
      const rw = box.width * scaleFactor;
      const rh = box.height * scaleFactor;
      return clickX >= rx && clickX <= rx + rw && clickY >= ry && clickY <= ry + rh;
    });

    if (clickedBox) {
      setSelectedDisease(clickedBox.label);
    }
  };

  const resetScanner = () => {
    setImage(null);
    setPredictions([]);
    setSelectedDisease(null);
  };

  const diseaseInfo = selectedDisease ? DISEASE_DATABANK[selectedDisease] || {
    severity: 'Unknown',
    immediate: 'Isolate the plant until further analysis can be completed.',
    chemical: 'Chemical vector pending database update.',
    organic: 'Organic vector pending database update.'
  } : null;

  return (
    <div className="space-y-6 relative">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-emerald-500/10 blur-[100px] pointer-events-none -z-10"></div>

      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/30">
          <Scan className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
            Vision Inference Engine
          </h1>
          <p className="text-slate-500 text-sm font-medium">YOLOv8 Neural Network &bull; Live Diagnostics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl border border-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
          
          {!image ? (
            <label 
              onClick={handleBoxClick} 
              className="flex flex-col items-center justify-center w-full h-[400px] cursor-pointer group relative"
            >
              <div className="absolute inset-0 border-2 border-dashed border-slate-300 rounded-2xl group-hover:border-emerald-400 group-hover:bg-emerald-50/50 transition-all duration-300"></div>
              <div className="relative z-10 flex flex-col items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-shadow">
                  <Upload className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Upload Target Image</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium">Drag & drop or click to browse</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          ) : (
            <div className="relative flex flex-col items-center w-full">
              <div className="relative rounded-xl overflow-hidden shadow-2xl ring-1 ring-slate-200">
                <img 
                  src={image} 
                  alt="Target" 
                  className={`max-w-full max-h-[500px] object-contain transition-all duration-500 ${loading ? 'opacity-50 grayscale-[50%]' : 'hidden'}`} 
                />
                
                {loading && (
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    <div className="w-full h-1 bg-emerald-400 shadow-[0_0_20px_5px_rgba(52,211,153,0.7)] absolute animate-scan"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center bg-slate-900/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-700/50">
                      <Cpu className="h-8 w-8 text-emerald-400 animate-pulse mb-2" />
                      <span className="text-emerald-400 font-mono text-sm font-bold tracking-widest uppercase">Processing Tensor...</span>
                    </div>
                  </div>
                )}

                {!loading && (
                  <canvas 
                    ref={canvasRef} 
                    onClick={handleCanvasClick} 
                    className="cursor-crosshair w-full block transition-opacity duration-700 opacity-100"
                  />
                )}
              </div>

              {!loading && (
                <div className="w-full flex justify-between items-center mt-6">
                  <div className="flex items-center bg-amber-50/80 backdrop-blur-sm border border-amber-200 px-4 py-2 rounded-lg text-amber-700 text-sm font-semibold shadow-sm">
                    <span className="relative flex h-3 w-3 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                    Tap highlighted regions for treatment data
                  </div>
                  
                  <button 
                    onClick={resetScanner}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>New Scan</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-slate-900 rounded-2xl p-1 shadow-2xl relative overflow-hidden h-[500px]">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 to-transparent pointer-events-none"></div>
          
          <div className="bg-slate-900 h-full rounded-xl p-5 overflow-y-auto relative z-10 border border-slate-800">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-4 flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <span>Diagnostic Output</span>
            </h2>

            {!selectedDisease ? (
              <div className="flex flex-col items-center justify-center text-center h-[350px] text-slate-500 space-y-4">
                <div className="p-4 rounded-full bg-slate-800/50">
                  <ShieldAlert className="h-10 w-10 text-slate-600" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-300">Awaiting Target Selection</p>
                  <p className="text-sm mt-1 max-w-[220px] mx-auto">Upload telemetry and select a detected bounding box to compile treatment vectors.</p>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-6 animate-fadeIn">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                    {diseaseInfo.severity} Threat Level
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-3 leading-tight">{selectedDisease}</h3>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="bg-slate-800/80 border border-amber-500/30 rounded-xl p-4 relative overflow-hidden group hover:border-amber-500/60 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                    <h4 className="font-bold text-amber-400 flex items-center"><CheckCircle2 className="h-4 w-4 mr-2" /> Immediate Action</h4>
                    <p className="text-slate-300 mt-2 text-sm leading-relaxed">{diseaseInfo.immediate}</p>
                  </div>

                  <div className="bg-slate-800/80 border border-emerald-500/30 rounded-xl p-4 relative overflow-hidden group hover:border-emerald-500/60 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    <h4 className="font-bold text-emerald-400 flex items-center"><CheckCircle2 className="h-4 w-4 mr-2" /> Bio / Organic Protocol</h4>
                    <p className="text-slate-300 mt-2 text-sm leading-relaxed">{diseaseInfo.organic}</p>
                  </div>

                  <div className="bg-slate-800/80 border border-blue-500/30 rounded-xl p-4 relative overflow-hidden group hover:border-blue-500/60 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <h4 className="font-bold text-blue-400 flex items-center"><CheckCircle2 className="h-4 w-4 mr-2" /> Chemical Vector</h4>
                    <p className="text-slate-300 mt-2 text-sm leading-relaxed">{diseaseInfo.chemical}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Diagnostic;
import React, { useState, useEffect } from 'react';
import { 
  CloudLightning, HelpCircle, AlertTriangle, Wind, ThermometerSun, 
  Droplets, MapPin, CheckCircle2, XCircle, Leaf, TrendingUp, 
  Send, Sprout, BarChart3, MessageSquare, Sparkles, Shield 
} from 'lucide-react';
import Diagnostic from './Diagnostic'; 

function Dashboard({ onRequireAuth }) {
  // State to track which tasks are checked off
  const [completedTasks, setCompletedTasks] = useState([]);

  // Upgraded Live Analytics State
  const [analytics, setAnalytics] = useState({
    farmName: 'Loading...',
    totalScans: 0,
    healthyPercentage: 100,
    threatPercentage: 0,
    environment: {
      humidity: 0,
      windSpeed: 0,
      sprayCondition: 'LOADING',
      sprayWarning: 'Fetching local meteorological data...'
    },
    intelligence: {
      activeThreat: null,
      recommendedAction: 'Awaiting cloud intelligence.',
      actionSchedule: [] // Holds our dynamic tasks
    },
    market: {
      currentPrice: 0,
      isTrendingUp: true,
      percentChange: "0.0",
      chartHeights: [0,0,0,0,0,0,0,0,0,0],
      rawPrices: [0,0,0,0,0,0,0,0,0,0]
    }
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = localStorage.getItem('token');
      if (!token) return; 

      try {
        const response = await fetch('https://crop-ai-rmsb.onrender.com/api/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
          // Reset tasks when new data comes in
          setCompletedTasks([]);
        }
      } catch (err) {
        console.error("Failed to fetch cloud analytics");
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* ========================================== */}
      {/* ROW 1: MAIN BENTO GRID (Scanner & Alerts)    */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: TELEMETRY & DIAGNOSTICS (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          {/* Top Header: Location & Weather Summary */}
          <div className="flex justify-between items-start bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div>
              <p className="text-slate-400 font-medium text-sm mb-1">Today</p>
              <div className="flex items-end space-x-3">
                <h1 className="text-5xl font-black text-slate-800 tracking-tighter">32°C</h1>
                <div className="pb-1">
                  <p className="text-sm font-bold text-amber-500 flex items-center">
                    <ThermometerSun className="h-4 w-4 mr-1" /> Sunny
                  </p>
                  <p className="text-xs text-slate-500 font-medium">H:35°C | L:24°C</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-full text-slate-600 font-medium text-sm">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span>Pune, Maharashtra</span>
            </div>
          </div>

          {/* Centerpiece: The Neural Network Scanner */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden min-h-[500px]">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
             
             <div className="mb-4 relative z-10">
               <h2 className="text-xl font-bold text-slate-800">YOLOv8 Diagnostic Engine</h2>
               <p className="text-sm text-slate-500">Upload field imagery for real-time neural inference.</p>
             </div>
             
             <div className="relative z-10">
               <Diagnostic onRequireAuth={onRequireAuth} />
             </div>
          </div>

          {/* Bottom Row: Environmental Mini-Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center space-x-2 text-slate-500 mb-4">
                <Wind className="h-5 w-5 text-blue-400" />
                <span className="font-semibold text-sm">Wind Speed</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{analytics.environment.windSpeed} <span className="text-sm font-medium text-slate-400">km/h</span></p>
                <p className="text-xs text-slate-400 mt-1">Live from meteo sensors.</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center space-x-2 text-slate-500 mb-4">
                <Droplets className="h-5 w-5 text-blue-500" />
                <span className="font-semibold text-sm">Humidity</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{analytics.environment.humidity}%</p>
                <p className="text-xs text-slate-400 mt-1">Ambient moisture levels.</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center space-x-2 text-slate-500 mb-4">
                <ThermometerSun className="h-5 w-5 text-amber-500" />
                <span className="font-semibold text-sm">Soil Temp</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">22°C</p>
                <p className="text-xs text-slate-400 mt-1">Optimal for root development.</p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ALERTS & SCHEDULES (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* Critical Alert Card */}
          <div className="bg-[#4CAF50] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
            <Leaf className="absolute -bottom-4 -right-4 h-32 w-32 text-white/10" />
            <h3 className="text-xl font-bold mb-1 relative z-10">System Status</h3>
            <p className="text-emerald-100 text-sm mb-6 relative z-10">Monitoring active threat vectors.</p>

            <div className="space-y-4 relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="bg-white/20 p-2 rounded-full mt-1"><CheckCircle2 className="h-4 w-4" /></div>
                  <div>
                    <p className="font-semibold text-sm">Irrigation Lines</p>
                    <p className="text-emerald-100 text-xs">Operating at normal pressure.</p>
                  </div>
                </div>
              </div>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="bg-white/20 p-2 rounded-full mt-1"><CheckCircle2 className="h-4 w-4" /></div>
                  <div>
                    <p className="font-semibold text-sm">Market Index</p>
                    <p className="text-emerald-100 text-xs">Pune Mandi stable at ₹4200/q.</p>
                  </div>
                </div>
              </div>
              
              {/* DYNAMIC SYSTEM STATUS THREAT BOX */}
              {analytics.intelligence.activeThreat ? (
                <div className="flex items-start justify-between bg-black/20 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
                  <div className="flex items-start space-x-3">
                    <div className="bg-red-500 text-white p-1.5 rounded-full mt-1"><XCircle className="h-4 w-4" /></div>
                    <div>
                      <p className="font-semibold text-sm">Active Threat: {analytics.intelligence.activeThreat}</p>
                      <p className="text-emerald-100 text-xs">{analytics.intelligence.recommendedAction}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between bg-black/20 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
                  <div className="flex items-start space-x-3">
                    <div className="bg-emerald-500 text-white p-1.5 rounded-full mt-1"><CheckCircle2 className="h-4 w-4" /></div>
                    <div>
                      <p className="font-semibold text-sm">All Systems Nominal</p>
                      <p className="text-emerald-100 text-xs">No active biological threats detected.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity / Schedule Card */}
          <div className="bg-[#E8F5E9] rounded-3xl p-6 shadow-sm flex-1 border border-[#C8E6C9] flex flex-col">
            <h3 className="text-xl font-bold text-slate-800 mb-1">Action Schedule</h3>
            <p className="text-slate-500 text-sm mb-5">Required interventions for today.</p>

            <div className="space-y-3">
              {analytics.intelligence.actionSchedule && analytics.intelligence.actionSchedule.length > 0 ? (
                analytics.intelligence.actionSchedule.map((task) => {
                  const isComplete = completedTasks.includes(task.id);
                  
                  return (
                    <div 
                      key={task.id}
                      className={`bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between border transition-all ${isComplete ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`h-3 w-3 rounded-full ${
                          task.type === 'immediate' ? 'bg-red-500' : 
                          task.type === 'chemical' ? 'bg-blue-500' : 
                          task.type === 'preventative' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}></div>
                        <div>
                          <p className={`font-bold text-sm ${isComplete ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                            {task.title}
                          </p>
                          <p className="text-xs text-slate-500">{task.desc}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => {
                          if (isComplete) {
                            setCompletedTasks(completedTasks.filter(id => id !== task.id));
                          } else {
                            setCompletedTasks([...completedTasks, task.id]);
                          }
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center ${
                          isComplete 
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {isComplete ? <><CheckCircle2 className="h-3 w-3 mr-1" /> Done</> : 'Mark Done'}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-4 text-sm text-slate-500">Awaiting diagnostic telemetry to formulate schedule.</div>
              )}
            </div>

            {/* DYNAMIC SPRAY CONDITIONS WIDGET */}
            <div className={`bg-white/50 rounded-2xl p-4 border border-white mt-auto mb-5 shadow-sm transition-colors ${analytics.environment.sprayCondition === 'POOR' ? 'hover:bg-red-50/50' : 'hover:bg-emerald-50/50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-800">Spray Conditions</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  analytics.environment.sprayCondition === 'POOR' 
                    ? 'text-red-700 bg-red-100 border border-red-200' 
                    : 'text-emerald-700 bg-emerald-100 border border-emerald-200'
                }`}>
                  {analytics.environment.sprayCondition}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${analytics.environment.sprayCondition === 'POOR' ? 'bg-red-400' : 'bg-emerald-400'}`} 
                  style={{ width: `${Math.min((analytics.environment.windSpeed / 20) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {analytics.environment.sprayWarning}
              </p>
            </div>

            {/* Live AI Insights Feed */}
            <div className="pt-5 border-t border-emerald-200/60">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
                     <Sparkles className="h-5 w-5" />
                     <span>Live AI Intelligence</span>
                   </div>
                   <span className="text-[9px] font-black bg-emerald-200/50 text-emerald-700 px-2 py-1 rounded-full uppercase tracking-widest flex items-center">
                     <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                     Synced
                   </span>
                 </div>

                 <div className="space-y-3">
                   <div className="bg-white/60 p-3.5 rounded-xl border border-white flex items-start space-x-3 hover:bg-white/80 transition-colors">
                       <div className="bg-blue-100 p-2 rounded-lg mt-0.5"><Droplets className="h-4 w-4 text-blue-600" /></div>
                       <div>
                           <p className="text-xs font-bold text-slate-800">Irrigation Warning</p>
                           <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Avoid overhead watering today. Ambient humidity is saturated; wet foliage will aggressively accelerate fungal spore germination.</p>
                       </div>
                   </div>

                   <div className="bg-white/60 p-3.5 rounded-xl border border-white flex items-start space-x-3 hover:bg-white/80 transition-colors">
                       <div className="bg-amber-100 p-2 rounded-lg mt-0.5"><Shield className="h-4 w-4 text-amber-600" /></div>
                       <div>
                           <p className="text-xs font-bold text-slate-800">Preventative Measure</p>
                           <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Ensure perimeter windbreaks are secure to prevent cross-field blight contamination.</p>
                       </div>
                   </div>
                 </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* ROW 2: MARKET TRENDS & ANALYTICS             */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Live Mandi Price Tracker (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
                Pune Mandi Market Trends
              </h2>
              <p className="text-slate-500 text-sm mt-1">Live algorithmic tracking for Grade-A Tomato pricing (₹ per Quintal).</p>
            </div>
            
            {/* Dynamic Price & Trend Badge */}
            <div className={`px-4 py-1.5 rounded-full border ${analytics.market.isTrendingUp ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <span className={`font-bold text-lg ${analytics.market.isTrendingUp ? 'text-emerald-700' : 'text-red-700'}`}>
                ₹{analytics.market.currentPrice.toLocaleString('en-IN')} 
                <span className="text-xs ml-2 font-black tracking-wider">
                  {analytics.market.isTrendingUp ? '▲' : '▼'} {analytics.market.percentChange}%
                </span>
              </span>
            </div>
          </div>

          {/* Dynamic CSS Chart */}
          <div className="flex items-end space-x-2 h-48 w-full mt-8 border-b-2 border-slate-100 pb-2">
            {analytics.market.chartHeights.map((height, index) => (
              <div 
                key={index} 
                className={`flex-1 rounded-t-md transition-all duration-700 relative group cursor-pointer ${
                  analytics.market.isTrendingUp 
                    ? 'bg-gradient-to-t from-emerald-100 to-emerald-300 hover:to-emerald-500' 
                    : 'bg-gradient-to-t from-slate-200 to-slate-400 hover:to-slate-600'
                }`}
                style={{ height: `${height}%` }}
              >
                {/* Dynamic Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-xl transition-opacity pointer-events-none whitespace-nowrap z-20">
                  ₹{analytics.market.rawPrices[index]}
                  <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between text-xs text-slate-400 font-bold mt-4 px-2 uppercase tracking-widest">
            <span>10 Days Ago</span>
            <span>5 Days Ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Real-Time Database Analytics (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 rounded-3xl p-6 shadow-md text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[50px] pointer-events-none"></div>
           
           <h2 className="text-xl font-bold flex items-center mb-6 relative z-10">
             <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
             {analytics.farmName} Analytics
           </h2>
           
           <div className="space-y-6 relative z-10">
             <div>
               <p className="text-slate-400 text-sm mb-1">Total Network Scans</p>
               <h3 className="text-4xl font-black text-white">{analytics.totalScans} <span className="text-lg text-slate-400 font-medium tracking-normal">Logs</span></h3>
             </div>

             <div className="space-y-3">
               <div>
                 <div className="flex justify-between text-xs mb-1">
                   <span className="text-slate-300">Healthy Crop Base</span>
                   <span className="font-bold text-white">{analytics.healthyPercentage}%</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-blue-400 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${analytics.healthyPercentage}%` }}></div></div>
               </div>
               
               <div>
                 <div className="flex justify-between text-xs mb-1">
                   <span className="text-slate-300">Pest/Fungal Threat Vector</span>
                   <span className="font-bold text-red-400">{analytics.threatPercentage}%</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-red-400 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${analytics.threatPercentage}%` }}></div></div>
               </div>
             </div>
             
             <p className="text-xs text-slate-400 mt-4 border-t border-slate-700 pt-4 leading-relaxed">
               Data synchronized live from MongoDB Atlas. Threat vectors represent the percentage of scans indicating active YOLOv8 bounding box classifications.
             </p>
           </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* ROW 3: FEEDBACK MODULE                       */}
      {/* ========================================== */}
      <div className="bg-gradient-to-br from-slate-100 to-white border border-slate-200 rounded-3xl p-8 md:p-12 text-center shadow-sm relative overflow-hidden mt-12">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
        
        <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-6 w-6 text-emerald-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Help Train the Neural Network</h2>
        <p className="text-slate-500 max-w-2xl mx-auto mb-8 text-sm">Did the AI misidentify a disease? Report inaccuracies directly to our engineering team to improve the next YOLOv8 weight update.</p>
        
        <div className="flex flex-col sm:flex-row justify-center max-w-xl mx-auto gap-3">
          <input 
            type="text" 
            placeholder="Describe what the AI missed..." 
            className="flex-1 px-5 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all shadow-sm"
          />
          <button className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
            <span>Submit Data</span>
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* FOOTER                                       */}
      {/* ========================================== */}
      <footer className="border-t border-slate-200 mt-12 pt-8 pb-4 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
        <div className="flex items-center space-x-2 font-bold text-slate-700 mb-4 md:mb-0">
          <Sprout className="h-5 w-5 text-emerald-600" />
          <span>Crop.AI Analytics © 2026</span>
        </div>
        <div className="flex space-x-6 font-medium">
          <a href="#" className="hover:text-emerald-600 transition-colors">System Status</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">Data Privacy</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">Developer API</a>
        </div>
      </footer>

    </div>
  );
}

export default Dashboard;
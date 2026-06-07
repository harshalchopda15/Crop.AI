import React, { useState } from 'react';
import { Sprout, X, Mail, Lock, User } from 'lucide-react';

function Auth({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  
  // NEW: State to hold user input and errors
  const [formData, setFormData] = useState({ farmName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // NEW: The function that actually talks to MongoDB
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Success! Save the token, close the modal, and refresh to update state
      localStorage.setItem('token', data.token);
      localStorage.setItem('farmName', data.farmName);
      onClose();
      window.location.reload(); // Quick way to let the app know we are logged in

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sprout className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {isLogin ? 'Enter your details to access your field hub.' : 'Join Crop.AI to protect your crops.'}
          </p>
        </div>

        {/* Display Error Messages */}
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center font-medium border border-red-100">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                required
                placeholder="Farm / Organization Name" 
                value={formData.farmName}
                onChange={(e) => setFormData({...formData, farmName: e.target.value})}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-all text-slate-800"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input 
              type="email" 
              required
              placeholder="Email Address" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-all text-slate-800"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input 
              type="password" 
              required
              placeholder="Password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-all text-slate-800"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5 mt-2 flex justify-center"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }} 
            className="text-emerald-600 font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
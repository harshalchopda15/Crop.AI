import React, { useState, useEffect } from 'react';
import { Sprout, LogIn, UserPlus, LogOut } from 'lucide-react';

function Navbar({ onOpenAuth }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [farmName, setFarmName] = useState('');

  // Check local storage exactly once when the Navbar loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedFarm = localStorage.getItem('farmName');
    
    if (token) {
      setIsLoggedIn(true);
      setFarmName(storedFarm || 'Active Farm');
    }
  }, []);

  // Secure logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('farmName');
    window.location.reload(); // Refresh the page to clear all data
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xl cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Sprout className="h-6 w-6" />
            <span>Crop.AI</span>
          </div>

          <div className="flex space-x-3 items-center">
            {isLoggedIn ? (
              <>
                <span className="hidden sm:block text-sm font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full mr-2 border border-emerald-200">
                  {farmName}
                </span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-sm font-semibold rounded-lg shadow-sm transition-all border border-slate-200 hover:border-red-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Disconnect</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={onOpenAuth}
                  className="hidden sm:flex items-center space-x-1 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Log In</span>
                </button>
                <button 
                  onClick={onOpenAuth}
                  className="flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-md transition-all hover:-translate-y-0.5"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
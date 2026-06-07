import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Auth from './components/Auth'; // Import the new modal

function App() {
  // State to control if the modal is visible
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans scroll-smooth">
      {/* Pass the opening function to Navbar */}
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />

      <main className="flex-1 w-full">
        {/* Pass the auth trigger down to the Dashboard */}
        <Dashboard onRequireAuth={() => setIsAuthOpen(true)} />
      </main>

      {/* Render the modal, pass the closing function */}
      <Auth isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import { StreamProvider, useStream } from './context/StreamContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { status } = useStream();

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">

          {/* Header */}
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {activeTab === 'dashboard' ? 'System Overview' : 'System Configuration'}
              </h2>
              <p className="text-zinc-400 text-sm">
                {activeTab === 'dashboard' ? 'Monitor and control your livestream instance.' : 'Manage stream keys, video files, and performance.'}
              </p>
            </div>
            <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${status?.running
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}>
              <div className={`w-2.5 h-2.5 rounded-full ${status?.running ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'}`} />
              <span className="text-sm font-medium tracking-wide">{status?.running ? 'STREAMING ACTIVE' : 'STREAM OFFLINE'}</span>
            </div>
          </header>

          {/* Tab Content */}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'settings' && <Settings />}

        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <StreamProvider>
      <AppContent />
    </StreamProvider>
  );
}

import React from 'react';
import { LayoutDashboard, Settings, Radio, Server } from 'lucide-react';

const NavItem = ({ id, icon: Icon, label, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${activeTab === id
            ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
            }`}
    >
        <Icon size={20} className={activeTab === id ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300'} />
        <span className="font-medium">{label}</span>
    </button>
);

export default function Sidebar({ activeTab, setActiveTab }) {
    return (
        <aside className="w-64 bg-zinc-900/50 border-r border-zinc-800 flex flex-col">
            <div className="p-6 border-b border-zinc-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <Radio size={18} className="text-white" />
                    </div>
                    <h1 className="font-bold text-lg tracking-tight">StreamCenter</h1>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" activeTab={activeTab} setActiveTab={setActiveTab} />
                <NavItem id="settings" icon={Settings} label="Configuration" activeTab={activeTab} setActiveTab={setActiveTab} />
            </nav>

            <div className="p-4 border-t border-zinc-800/50">
                <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                        <Server size={12} /> VPS Status
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-zinc-300">4 Cores</span>
                        <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded border border-green-900/50">Online</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}

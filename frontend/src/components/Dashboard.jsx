import React from 'react';
import { Activity, Clock, Cpu, Play, Square, Terminal, Radio } from 'lucide-react';
import { useStream } from '../context/StreamContext';

export default function Dashboard() {
    const { status, config, logs, startStream, stopStream } = useStream();

    return (
        <div className="space-y-6">
            {/* Live Preview */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-1 overflow-hidden shadow-lg mb-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                    {config?.channel_id ? (
                        <iframe
                            src={`https://www.youtube.com/embed/live_stream?channel=${config.channel_id}`}
                            className="w-full h-full"
                            frameBorder="0"
                            allowFullScreen
                            title="Live Preview"
                        ></iframe>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
                            <Radio size={48} className="mb-2 opacity-50" />
                            <p>Enter Channel ID in Settings to enable Preview</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                    <div className="flex items-center gap-3 text-zinc-400 mb-2">
                        <Activity size={18} /> <span className="text-sm font-medium">Current Status</span>
                    </div>
                    <div className="text-2xl font-semibold text-white">{status?.status || 'Unknown'}</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                    <div className="flex items-center gap-3 text-zinc-400 mb-2">
                        <Clock size={18} /> <span className="text-sm font-medium">Next Restart</span>
                    </div>
                    <div className="text-2xl font-mono font-semibold text-white">
                        {status?.next_restart ? new Date(status.next_restart).toLocaleTimeString() : '--:--:--'}
                    </div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                    <div className="flex items-center gap-3 text-zinc-400 mb-2">
                        <Cpu size={18} /> <span className="text-sm font-medium">Performance Profile</span>
                    </div>
                    <div className="text-2xl font-semibold text-white capitalize">
                        {config?.performance_profile?.replace('_', ' ') || 'Loading...'}
                    </div>
                </div>
            </div>

            {/* Main Control Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Controls */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={startStream}
                                disabled={status?.running}
                                className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl bg-zinc-800/50 hover:bg-green-500/10 hover:border-green-500/50 border border-zinc-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <Play size={28} className="text-green-500 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-zinc-300 group-hover:text-green-400">Start</span>
                            </button>
                            <button
                                onClick={stopStream}
                                disabled={!status?.running}
                                className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl bg-zinc-800/50 hover:bg-red-500/10 hover:border-red-500/50 border border-zinc-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <Square size={28} className="text-red-500 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-zinc-300 group-hover:text-red-400">Stop</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Logs */}
                <div className="lg:col-span-2">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-[300px]">
                        <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Terminal size={14} className="text-zinc-400" />
                                <span className="text-xs font-mono text-zinc-400">System Logs</span>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                            </div>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-1">
                            {logs.length === 0 && <span className="text-zinc-600 italic">Waiting for system events...</span>}
                            {logs.map((log, i) => (
                                <div key={i} className="text-zinc-400 border-l-2 border-zinc-800 pl-2 hover:bg-zinc-900/50 transition-colors">
                                    <span className="text-zinc-600 mr-2">{log.split(']')[0]}]</span>
                                    <span className="text-zinc-300">{log.split(']')[1]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

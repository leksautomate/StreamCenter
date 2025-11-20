import React from 'react';
import { Radio, Cpu, ShieldCheck } from 'lucide-react';
import { useStream } from '../context/StreamContext';
import MediaLibrary from './MediaLibrary';

export default function Settings() {
    const { config, setConfig, saveConfig } = useStream();

    if (!config) return <div className="text-zinc-500">Loading configuration...</div>;

    const handleSubmit = (e) => {
        e.preventDefault();
        saveConfig(config);
    };

    return (
        <div className="max-w-3xl">
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Stream Settings */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Radio size={20} className="text-blue-500" /> Stream Configuration
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Stream Key</label>
                            <input
                                type="password"
                                value={config.stream_key}
                                onChange={e => setConfig({ ...config, stream_key: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                                placeholder="Enter YouTube Stream Key"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1.5">RTMP URL</label>
                            <input
                                type="text"
                                value={config.rtmp_url}
                                onChange={e => setConfig({ ...config, rtmp_url: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Performance Settings */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Cpu size={20} className="text-purple-500" /> Performance Tuning
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Performance Profile</label>
                            <select
                                value={config.performance_profile}
                                onChange={e => setConfig({ ...config, performance_profile: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all"
                            >
                                <option value="vps_optimized">VPS Optimized (4GB RAM / 4 vCPU)</option>
                                <option value="balanced">Balanced</option>
                                <option value="high_quality">High Quality</option>
                            </select>
                            <p className="text-xs text-zinc-500 mt-2">
                                "VPS Optimized" uses <code>veryfast</code> preset and 3 threads. Tuned for your specific hardware.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Stream Duration (s)</label>
                            <input
                                type="number"
                                value={config.stream_duration}
                                onChange={e => setConfig({ ...config, stream_duration: parseInt(e.target.value) })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* YouTube Settings */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Radio size={20} className="text-red-500" /> YouTube Integration
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1.5">Channel ID (for Preview)</label>
                        <input
                            type="text"
                            value={config.channel_id || ''}
                            onChange={e => setConfig({ ...config, channel_id: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all"
                            placeholder="e.g., UCxxxxxxxxxxxxxxx"
                        />
                        <p className="text-xs text-zinc-500 mt-2">
                            Required for the dashboard live preview. Find it in your YouTube Studio URL.
                        </p>
                    </div>
                </div>

                {/* Media Library Component */}
                <MediaLibrary />

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-green-900/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <ShieldCheck size={18} /> Save Configuration
                    </button>
                </div>

            </form>
        </div>
    );
}

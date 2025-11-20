import React from 'react';
import { Upload, FileVideo, Trash2, CheckCircle } from 'lucide-react';
import { useStream } from '../context/StreamContext';

export default function MediaLibrary() {
    const { config, videos, uploading, uploadVideo, deleteVideo, selectVideo } = useStream();

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        await uploadVideo(file);
    };

    const handleDeleteVideo = async (filename) => {
        if (!window.confirm(`Are you sure you want to delete ${filename}?`)) return;
        await deleteVideo(filename);
    };

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FileVideo size={20} className="text-green-500" /> Media Library
                </h3>
                <label className={`cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${uploading ? 'opacity-50 cursor-wait' : ''}`}>
                    <Upload size={16} />
                    {uploading ? 'Uploading...' : 'Upload Video'}
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="video/*" disabled={uploading} />
                </label>
            </div>

            <div className="space-y-3">
                {videos.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 bg-zinc-950/50 rounded-lg border border-zinc-800 border-dashed">
                        No videos found. Upload one to get started.
                    </div>
                ) : (
                    videos.map((video) => (
                        <div
                            key={video.name}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${config?.video_file === video.path || config?.video_file?.endsWith(video.name)
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config?.video_file === video.path || config?.video_file?.endsWith(video.name) ? 'bg-green-500/20 text-green-400' : 'bg-zinc-900 text-zinc-500'
                                    }`}>
                                    <FileVideo size={20} />
                                </div>
                                <div>
                                    <div className="font-medium text-white">{video.name}</div>
                                    <div className="text-xs text-zinc-500">{video.size_mb} MB</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {config?.video_file === video.path || config?.video_file?.endsWith(video.name) ? (
                                    <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                                        <CheckCircle size={12} /> Active Source
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => selectVideo(video.path)}
                                        className="text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded border border-zinc-700 transition-colors"
                                    >
                                        Select
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => handleDeleteVideo(video.name)}
                                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                    title="Delete Video"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

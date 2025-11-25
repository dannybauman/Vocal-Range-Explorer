import React from 'react';
import { VocalAnalysis } from '../types';

interface ResultsViewProps {
  analysis: VocalAnalysis;
  lowNote: string;
  highNote: string;
  onReset: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ analysis, lowNote, highNote, onReset }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 p-8 rounded-3xl border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 text-center space-y-4">
            <h2 className="text-slate-400 text-sm font-bold tracking-widest uppercase">Your Voice Type</h2>
            <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-purple-300">
                {analysis.voiceType}
            </h1>
            <div className="inline-flex items-center space-x-4 bg-slate-800/50 px-6 py-2 rounded-full border border-slate-700/50 backdrop-blur-md">
                <span className="text-indigo-400 font-mono font-bold">{lowNote}</span>
                <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                <span className="text-purple-400 font-mono font-bold">{highNote}</span>
            </div>
            <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed pt-4">
                {analysis.description}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Songs Card */}
        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-sm hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-pink-500/10 rounded-lg">
                    <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white">Suggested Songs</h3>
            </div>
            <div className="space-y-4">
                {analysis.songs.map((song, idx) => (
                    <div key={idx} className="group p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-pink-500/30 transition-all">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-slate-200 group-hover:text-pink-300 transition-colors">{song.title}</h4>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-800 px-2 py-1 rounded">{song.artist}</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-snug">{song.reason}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Exercises Card */}
        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-sm hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white">Recommended Exercises</h3>
            </div>
            <div className="space-y-4">
                {analysis.exercises.map((ex, idx) => (
                    <div key={idx} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                        <h4 className="font-bold text-emerald-300 mb-2">{ex.name}</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">{ex.instructions}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button 
            onClick={onReset}
            className="group relative px-8 py-3 rounded-full bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-all border border-slate-600 hover:border-slate-500"
        >
            <span className="flex items-center space-x-2">
                <svg className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <span>Test Again</span>
            </span>
        </button>
      </div>
    </div>
  );
};

export default ResultsView;

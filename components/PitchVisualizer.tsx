import React from 'react';
import { NoteData } from '../types';

interface PitchVisualizerProps {
  currentNote: NoteData | null;
  targetLabel: string;
  isListening: boolean;
  onCapture: (note: NoteData) => void;
}

const PitchVisualizer: React.FC<PitchVisualizerProps> = ({ 
  currentNote, 
  targetLabel, 
  isListening,
  onCapture
}) => {
  const noteName = currentNote ? currentNote.note : '--';
  const octave = currentNote ? currentNote.octave : '';
  const freq = currentNote ? Math.round(currentNote.frequency) : 0;
  const deviation = currentNote ? currentNote.deviation : 0;

  // Visualizing the deviation (tuner style)
  // Range from -50 to +50 cents
  const needleRotation = Math.max(-45, Math.min(45, deviation)); // clamp rotation
  
  const isInTune = currentNote && Math.abs(deviation) < 15;
  const tunerColor = isInTune ? 'text-emerald-400 border-emerald-500' : 'text-slate-200 border-slate-600';
  const indicatorColor = isInTune ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-rose-500';

  return (
    <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-md mx-auto p-6 bg-slate-800/50 rounded-3xl border border-slate-700 backdrop-blur-sm shadow-xl">
      <div className="text-center space-y-2">
        <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">{targetLabel}</h3>
        {isListening ? (
             <div className="flex items-center justify-center space-x-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-emerald-400 font-medium">Listening...</span>
             </div>
        ) : (
            <span className="text-xs text-slate-500">Microphone paused</span>
        )}
      </div>

      {/* Main Tuner Display */}
      <div className={`relative w-48 h-48 rounded-full border-4 flex flex-col items-center justify-center transition-colors duration-300 ${tunerColor} bg-slate-900`}>
        <div className="text-5xl font-bold flex items-baseline">
            {noteName}
            <span className="text-2xl font-normal text-slate-400 ml-1">{octave}</span>
        </div>
        <div className="text-sm font-mono text-slate-500 mt-1">
          {freq > 0 ? `${freq} Hz` : '---'}
        </div>
        
        {/* Needle */}
        <div 
            className="absolute top-0 left-1/2 w-1 h-6 bg-slate-700 origin-bottom transform -translate-x-1/2"
            style={{ 
                height: '50%',
                top: '0', 
                transformOrigin: 'bottom center',
                transform: `translateX(-50%) rotate(${needleRotation}deg)`
            }}
        >
             <div className={`w-3 h-3 rounded-full absolute top-0 left-1/2 -translate-x-1/2 ${indicatorColor}`}></div>
        </div>
      </div>

      {/* Hz Bar */}
      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden relative">
        <div className="absolute top-0 bottom-0 w-1 bg-white left-1/2 -translate-x-1/2 z-10 opacity-30"></div>
        {currentNote && (
            <div 
                className={`absolute top-0 bottom-0 w-2 rounded-full transition-all duration-100 ${isInTune ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ 
                    left: `${50 + (deviation / 50) * 50}%`,
                    transform: 'translateX(-50%)'
                }}
            />
        )}
      </div>
      
      <div className="text-center w-full">
        <p className="text-slate-400 text-sm mb-4 min-h-[1.5rem]">
            {currentNote 
                ? "Note detected! Keep holding..." 
                : "Sing a clear, sustained tone"
            }
        </p>

        <div className="mb-4 bg-slate-700/30 p-3 rounded-lg border border-slate-600/30 mx-auto max-w-[90%]">
            <p className="text-xs text-slate-300">
                <span className="text-indigo-400 font-bold uppercase text-[10px] tracking-wide block mb-1">How to capture:</span> 
                Hold your note steady and click the button <strong>while</strong> you are singing.
            </p>
        </div>

        <button
            onClick={() => currentNote && onCapture(currentNote)}
            disabled={!currentNote}
            className={`
                px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform w-full
                ${currentNote 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25 text-white cursor-pointer' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
            `}
        >
            Capture This Note
        </button>
      </div>
    </div>
  );
};

export default PitchVisualizer;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, NoteData, VocalAnalysis } from './types';
import { autoCorrelate, getNoteFromFrequency } from './services/audioUtils';
import { analyzeVocalRange } from './services/geminiService';
import PitchVisualizer from './components/PitchVisualizer';
import ResultsView from './components/ResultsView';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [currentNote, setCurrentNote] = useState<NoteData | null>(null);
  const [lowNote, setLowNote] = useState<NoteData | null>(null);
  const [highNote, setHighNote] = useState<NoteData | null>(null);
  const [analysis, setAnalysis] = useState<VocalAnalysis | null>(null);
  const [error, setError] = useState<React.ReactNode | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number | null>(null);

  const startListening = async () => {
    try {
      // Initialize AudioContext if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Always resume context (it might be suspended from a previous stop)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream; // Keep reference to stream for cleanup

      const audioContext = audioContextRef.current;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      analyserRef.current = analyser;
      sourceRef.current = source;
      
      updatePitch();
      setAppState(AppState.DETECTING_LOW);
      setError(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setAppState(AppState.PERMISSION_DENIED);
    }
  };

  const updatePitch = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const buffer = new Float32Array(analyserRef.current.fftSize);
    analyserRef.current.getFloatTimeDomainData(buffer);
    
    const frequency = autoCorrelate(buffer, audioContextRef.current.sampleRate);
    
    if (frequency > -1) {
      const noteData = getNoteFromFrequency(frequency);
      setCurrentNote(noteData);
    } 

    requestRef.current = requestAnimationFrame(updatePitch);
  }, []);

  const stopListening = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    
    // Stop all tracks on the stream to release the mic
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    // Suspend the context to save resources
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
        audioContextRef.current.suspend();
    }
  };

  const handleCaptureLow = (note: NoteData) => {
    setLowNote(note);
    setAppState(AppState.DETECTING_HIGH);
  };

  const handleCaptureHigh = async (note: NoteData) => {
    setHighNote(note);
    stopListening();
    setAppState(AppState.ANALYZING);

    try {
        if (!lowNote) throw new Error("Low note missing");
        
        // Ensure low is actually lower than high, swap if needed for robustness
        let finalLow = lowNote.name;
        let finalHigh = note.name;
        
        if (lowNote.frequency > note.frequency) {
             finalLow = note.name;
             finalHigh = lowNote.name;
        }

        const result = await analyzeVocalRange(finalLow, finalHigh);
        setAnalysis(result);
        setAppState(AppState.RESULTS);
    } catch (e: any) {
        console.error("Analysis Error:", e);
        
        let errorNode: React.ReactNode = "Failed to analyze results. Please try again.";

        if (e.message === "API_KEY_MISSING") {
            errorNode = (
                <span>
                    <strong>API Key Missing:</strong> Please check your <code className="bg-rose-900/50 px-1 rounded">.env</code> file. It must contain a valid <code>API_KEY</code>.
                </span>
            );
        } else if (e.message === "API_KEY_INVALID") {
             errorNode = (
                <span>
                    <strong>Invalid API Key:</strong> The API key provided is rejected by Google. Please check your <code className="bg-rose-900/50 px-1 rounded">.env</code> file.
                </span>
            );
        } else if (e.message === "TIMEOUT") {
            errorNode = "The request timed out. Please check your internet connection and try again.";
        } else if (e.message === "NETWORK_ERROR") {
             errorNode = "Network error. Please check your internet connection.";
        }

        setError(errorNode);
        setAppState(AppState.WELCOME);
    }
  };

  const resetTest = () => {
      stopListening(); // Ensure everything is cleaned up
      setLowNote(null);
      setHighNote(null);
      setAnalysis(null);
      setCurrentNote(null);
      setAppState(AppState.WELCOME);
      setError(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-indigo-500 selection:text-white overflow-x-hidden flex flex-col">
      {/* Navbar / Header */}
      <header className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </div>
            <span className="font-bold text-xl tracking-tight">VocalRange<span className="text-indigo-400">Explorer</span></span>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center flex-grow">
        
        {appState === AppState.WELCOME && (
          <div className="text-center max-w-2xl mx-auto animate-fade-in space-y-8">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">True Voice</span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Discover your vocal range, determine if you're a Tenor, Baritone, or Soprano, and get personalized song suggestions powered by Gemini AI.
            </p>
            
            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6 text-sm">
                    {error}
                </div>
            )}

            <button 
              onClick={startListening}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-indigo-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-500 hover:scale-105 shadow-[0_0_20px_rgba(79,70,229,0.5)]"
            >
              Start Vocal Test
              <svg className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
            
            <p className="text-xs text-slate-500 mt-4">Requires microphone access. Works best in a quiet room.</p>
          </div>
        )}

        {appState === AppState.PERMISSION_DENIED && (
           <div className="text-center max-w-md mx-auto p-8 bg-slate-800 rounded-2xl border border-rose-500/30">
             <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Microphone Access Needed</h3>
             <p className="text-slate-400 mb-6">We need access to your microphone to analyze your pitch. Please allow permissions in your browser settings and try again.</p>
             <button onClick={() => setAppState(AppState.WELCOME)} className="text-indigo-400 hover:text-indigo-300 font-medium">Back to Home</button>
           </div>
        )}

        {(appState === AppState.DETECTING_LOW) && (
            <div className="animate-fade-in w-full">
                <div className="text-center mb-8">
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-indigo-400 mb-4">STEP 1 OF 2</span>
                    <h2 className="text-3xl font-bold">Sing Your Lowest Note</h2>
                    <p className="text-slate-400 mt-2">Relax your throat and hum or sing "Ahhh" as low as you comfortably can.</p>
                </div>
                <PitchVisualizer 
                    currentNote={currentNote} 
                    targetLabel="Current Pitch"
                    isListening={true}
                    onCapture={handleCaptureLow}
                />
            </div>
        )}

        {(appState === AppState.DETECTING_HIGH) && (
            <div className="animate-fade-in w-full">
                 <div className="text-center mb-8">
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-purple-400 mb-4">STEP 2 OF 2</span>
                    <h2 className="text-3xl font-bold">Sing Your Highest Note</h2>
                    <p className="text-slate-400 mt-2">Sing "Ahhh" and go up the scale. Stop before you strain or switch to falsetto (unless checking full range).</p>
                </div>
                <PitchVisualizer 
                    currentNote={currentNote} 
                    targetLabel="Current Pitch" 
                    isListening={true}
                    onCapture={handleCaptureHigh}
                />
                <div className="text-center mt-6">
                    <p className="text-sm text-slate-500">Captured Low Note: <span className="text-indigo-400 font-bold">{lowNote?.name}</span></p>
                </div>
            </div>
        )}

        {appState === AppState.ANALYZING && (
          <div className="text-center space-y-6 animate-pulse">
            <div className="relative w-24 h-24 mx-auto">
               <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30"></div>
               <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
               </div>
            </div>
            <h2 className="text-2xl font-bold">Analyzing your range...</h2>
            <p className="text-slate-400">Consulting with Gemini AI to generate your profile.</p>
          </div>
        )}

        {appState === AppState.RESULTS && analysis && lowNote && highNote && (
            <ResultsView 
                analysis={analysis}
                lowNote={lowNote.name}
                highNote={highNote.name}
                onReset={resetTest}
            />
        )}
      </main>

      <footer className="py-6 text-center text-slate-600 text-sm">
        <div className="space-y-1">
            <p>Built with help from <span className="text-indigo-400 font-medium">Gemini 3 Pro</span> and <span className="text-indigo-400 font-medium">Google AI Studio</span></p>
            <p className="text-xs text-slate-700">Special thanks to Jonas for inspiring us to sing together! 💈</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
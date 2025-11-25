export interface NoteData {
  frequency: number;
  note: string; // e.g., "C"
  octave: number; // e.g., 4
  deviation: number; // cents off
  name: string; // e.g., "C4"
}

export enum AppState {
  WELCOME = 'WELCOME',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DETECTING_LOW = 'DETECTING_LOW',
  DETECTING_HIGH = 'DETECTING_HIGH',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
}

export interface VocalAnalysis {
  voiceType: string;
  description: string;
  songs: { title: string; artist: string; reason: string }[];
  exercises: { name: string; instructions: string }[];
}

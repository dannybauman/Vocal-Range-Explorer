import { NoteData } from '../types';

const NOTE_STRINGS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/**
 * Converts a frequency to a musical note.
 */
export const getNoteFromFrequency = (frequency: number): NoteData | null => {
  if (frequency < 20 || frequency > 8000) return null;

  const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
  const midi = Math.round(noteNum) + 69;
  
  const noteIndex = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  const note = NOTE_STRINGS[noteIndex];
  
  // Calculate deviation in cents
  const perfectFreq = 440 * Math.pow(2, (midi - 69) / 12);
  const deviation = 1200 * Math.log2(frequency / perfectFreq);

  return {
    frequency,
    note,
    octave,
    deviation,
    name: `${note}${octave}`
  };
};

/**
 * AutoCorrelate algorithm for pitch detection
 */
export const autoCorrelate = (buffer: Float32Array, sampleRate: number): number => {
  const SIZE = buffer.length;
  let sumOfSquares = 0;
  
  // RMS (Root Mean Square) to check signal volume
  for (let i = 0; i < SIZE; i++) {
    const val = buffer[i];
    sumOfSquares += val * val;
  }
  const rms = Math.sqrt(sumOfSquares / SIZE);

  // Threshold to prevent detecting background noise
  if (rms < 0.01) {
    return -1; // Not enough signal
  }

  // Find the correlation
  let r1 = 0;
  let r2 = SIZE - 1;
  const threshold = 0.2;
  
  // Trim buffer to meaningful signal
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buffer[i]) < threshold) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buffer[SIZE - i]) < threshold) {
      r2 = SIZE - i;
      break;
    }
  }

  const trimmedBuffer = buffer.slice(r1, r2);
  const c = new Array(trimmedBuffer.length).fill(0);
  
  for (let i = 0; i < trimmedBuffer.length; i++) {
    for (let j = 0; j < trimmedBuffer.length - i; j++) {
      c[i] = c[i] + trimmedBuffer[j] * trimmedBuffer[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxval = -1;
  let maxpos = -1;
  
  for (let i = d; i < trimmedBuffer.length; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }
  
  let T0 = maxpos;

  // Parabolic interpolation for better precision
  const x1 = c[T0 - 1];
  const x2 = c[T0];
  const x3 = c[T0 + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
};

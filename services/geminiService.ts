import { GoogleGenAI, Type } from "@google/genai";
import { VocalAnalysis } from '../types';

const getGeminiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found in environment variables");
    }
    return new GoogleGenAI({ apiKey });
};

export const analyzeVocalRange = async (
  lowNote: string, 
  highNote: string
): Promise<VocalAnalysis> => {
  const ai = getGeminiClient();

  const prompt = `
    I have tested my vocal range. 
    My lowest comfortable note is ${lowNote}.
    My highest comfortable note is ${highNote}.
    
    Based on this:
    1. Determine my likely voice type (e.g., Bass, Baritone, Tenor, Alto, Mezzo-Soprano, Soprano).
    2. Provide a short, encouraging description of this range.
    3. Suggest 3 popular songs that would suit this range well.
    4. Suggest 2 vocal exercises to improve or expand this range.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          voiceType: { type: Type.STRING },
          description: { type: Type.STRING },
          songs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                reason: { type: Type.STRING }
              }
            }
          },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                instructions: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(text) as VocalAnalysis;
};

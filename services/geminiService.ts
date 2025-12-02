import { GoogleGenAI, Type } from "@google/genai";
import { VocalAnalysis } from '../types';

const getGeminiClient = () => {
    const apiKey = process.env.API_KEY;
    // Check for undefined, null, or empty string (often happens if .env is missing or empty)
    if (!apiKey || apiKey === "undefined" || apiKey.trim() === "") {
      throw new Error("API_KEY_MISSING");
    }
    return new GoogleGenAI({ apiKey });
};

export const analyzeVocalRange = async (
  lowNote: string, 
  highNote: string
): Promise<VocalAnalysis> => {
  try {
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

    // Create a timeout promise to prevent hanging indefinitely
    const timeoutMs = 15000;
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("TIMEOUT")), timeoutMs)
    );

    const apiCallPromise = ai.models.generateContent({
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

    // Race the API call against the timeout
    const response: any = await Promise.race([apiCallPromise, timeoutPromise]);

    const text = response.text;
    if (!text) {
      throw new Error("EMPTY_RESPONSE");
    }

    return JSON.parse(text) as VocalAnalysis;

  } catch (error: any) {
    console.error("Gemini Service Error:", error);

    const msg = error.message || error.toString();

    // Handle specific error cases to help the UI display better messages
    if (msg === "API_KEY_MISSING") {
        throw new Error("API_KEY_MISSING");
    }
    
    if (msg.includes("400") || msg.includes("API key not valid") || msg.includes("API_KEY_INVALID")) {
        throw new Error("API_KEY_INVALID");
    }

    if (msg === "TIMEOUT") {
        throw new Error("TIMEOUT");
    }

    if (msg.includes("fetch failed") || msg.includes("NetworkError")) {
        throw new Error("NETWORK_ERROR");
    }

    throw new Error("GENERIC_ERROR");
  }
};
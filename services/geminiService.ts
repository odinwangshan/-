import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Safely initialize the client only if key exists, otherwise we mock or handle gracefully
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateMissionBriefing = async (score: number): Promise<string> => {
  if (!ai) {
    return "Mission Briefing: Collect stardust. Avoid space trash. Good luck, Cadet!";
  }

  try {
    const model = ai.models;
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a short, funny, sci-fi "Mission Debrief" for a pilot flying a Donut Spaceship who just scored ${score} points collecting sugar dust while dodging space garbage. Keep it under 50 words. Be encouraging but silly.`,
    });
    return response.text || "Connection lost... standard briefing applied.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Communications offline. The donut command center is silent.";
  }
};
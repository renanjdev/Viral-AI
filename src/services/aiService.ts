import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types.ts";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function analyzeVideo(videoPath: string): Promise<AnalysisResult[]> {
  // In a real production system:
  // 1. Extract audio
  // 2. Transcribe audio to text
  // 3. Send transcript to Gemini for analysis
  
  // For this MVP simulation, we'll return a set of "detected" segments.
  // We'll simulate a delay as if transcription was happening.
  await new Promise(resolve => setTimeout(resolve, 3000));

  if (!GEMINI_API_KEY || GEMINI_API_KEY === "MY_GEMINI_API_KEY" || GEMINI_API_KEY === "your-gemini-api-key-here") {
    console.warn("GEMINI_API_KEY not found or using placeholder, using fallback mock analysis");
    return getMockAnalysis();
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Imagine um vídeo de 2 minutos sobre tecnologia ou empreendedorismo. Sugira 3 destaques curtos para viralizar com tempos de início/fim (abaixo de 120s), títulos e pontuações de viralidade (0-100). Responda em Português do Brasil.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              startTime: { type: Type.NUMBER },
              endTime: { type: Type.NUMBER },
              viralScore: { type: Type.INTEGER },
              reasoning: { type: Type.STRING }
            },
            required: ["title", "startTime", "endTime", "viralScore", "reasoning"]
          }
        }
      }
    });

    return JSON.parse(response.text) as AnalysisResult[];
  } catch (err) {
    console.error("AI Analysis failed:", err);
    return getMockAnalysis();
  }
}

function getMockAnalysis(): AnalysisResult[] {
  return [
    {
      title: "O Gancho",
      startTime: 0,
      endTime: 10,
      viralScore: 95,
      reasoning: "Abertura impactante que prende a atenção nos primeiros segundos."
    },
    {
      title: "Opinião Polêmica",
      startTime: 30,
      endTime: 45,
      viralScore: 88,
      reasoning: "Expressa uma opinião forte que gera comentários e debate."
    },
    {
      title: "A Revelação",
      startTime: 90,
      endTime: 110,
      viralScore: 92,
      reasoning: "Conclusão satisfatória com grande impacto visual ou informativo."
    }
  ];
}

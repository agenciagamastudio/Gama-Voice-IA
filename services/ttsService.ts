
import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName } from "../types";

const API_KEY = process.env.API_KEY || "";

export class TTSService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  async *synthesizeStream(text: string, voice: VoiceName) {
    try {
      const responseStream = await this.ai.models.generateContentStream({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ 
          parts: [{ 
            text: `Aja como uma voz profissional de rádio e publicidade (estilo Ember do ChatGPT). Leia o seguinte texto com entonação natural e pausas orgânicas: ${text}` 
          }] 
        }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      for await (const chunk of responseStream) {
        const base64Audio = chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          yield base64Audio;
        }
      }
    } catch (error) {
      console.error("Erro no stream TTS:", error);
      throw error;
    }
  }
}

export const ttsService = new TTSService();

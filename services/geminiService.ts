import { GoogleGenAI } from "@google/genai";

/**
 * Validates an API key by making a simple test request.
 */
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey || !apiKey.trim()) {
    return false;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    // 간단한 테스트 요청으로 API 키 유효성 검증
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{ text: 'test' }]
      },
      config: {
        maxOutputTokens: 1
      }
    });
    return true;
  } catch (error) {
    console.error("API key validation failed:", error);
    return false;
  }
};

/**
 * Converts a Blob to a Base64 string.
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:audio/webm;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generateMeetingNotes = async (
  audioBlob: Blob,
  mimeType: string,
  apiKey: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error('API 키가 필요합니다.');
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Audio = await blobToBase64(audioBlob);

    const model = 'gemini-2.5-flash';
    
    // System instruction to guide the persona
    const systemInstruction = `You are an expert executive assistant and professional note-taker. 
    Your goal is to listen to meeting recordings and produce high-quality, structured business meeting notes.`;

    const prompt = `
      Please process the attached audio recording of a meeting.
      
      Task:
      1. Analyze the audio content carefully.
      2. Generate a professional business meeting note in Markdown format.
      
      The structure must include:
      - **Meeting Summary**: A brief executive summary of what was discussed.
      - **Attendees**: List of inferred speakers (e.g., Speaker 1, Speaker 2) or names if explicitly mentioned.
      - **Key Discussion Points**: Bulleted list of main topics.
      - **Decisions Made**: Clear list of agreed-upon decisions.
      - **Action Items**: A checklist of tasks assigned to specific people (if any).
      
      At the very end, include a section titled "## Verbatim Transcript" with the full text transcription of the meeting.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3, // Lower temperature for more factual notes
      }
    });

    return response.text || "No notes generated.";
  } catch (error) {
    console.error("Error generating meeting notes:", error);
    throw error;
  }
};

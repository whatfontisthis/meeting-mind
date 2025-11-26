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
    const systemInstruction = `당신은 전문적인 비서이자 회의록 작성 전문가입니다. 
    회의 녹음을 듣고 고품질의 구조화된 비즈니스 회의록을 한국어로 작성하는 것이 목표입니다.`;

    const prompt = `
      첨부된 회의 오디오 녹음을 처리해주세요.
      
      작업:
      1. 오디오 내용을 주의 깊게 분석하세요.
      2. 마크다운 형식으로 전문적인 비즈니스 회의록을 한국어로 생성하세요.
      
      반드시 포함해야 할 구조:
      - **회의 요약**: 논의된 내용에 대한 간단한 요약
      - **참석자**: 추론된 발언자 목록 (예: 발언자 1, 발언자 2) 또는 명시적으로 언급된 이름
      - **주요 논의 사항**: 주요 주제의 불릿 포인트 목록
      - **결정 사항**: 합의된 결정 사항의 명확한 목록
      - **액션 아이템**: 특정 사람에게 할당된 작업의 체크리스트 (있는 경우)
      
      마지막에 "## 전체 전사본"이라는 제목의 섹션을 포함하여 회의의 전체 텍스트 전사본을 추가하세요.
      
      모든 내용은 반드시 한국어로 작성해야 합니다.
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

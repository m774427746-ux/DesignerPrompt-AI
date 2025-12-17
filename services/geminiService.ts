import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { MODELS, SYSTEM_INSTRUCTION } from "../constants";

// Helper to ensure fresh instance with potentially updated key
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- Chat & Text Features ---

export const generateChatResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  useThinking: boolean = false,
  useSearch: boolean = false
): Promise<{ text: string; sources?: any[] }> => {
  const ai = getAI();
  const modelId = useThinking ? MODELS.CHAT_SMART : MODELS.CHAT_FAST;
  
  const tools: any[] = [];
  if (useSearch) {
    tools.push({ googleSearch: {} });
  }

  const config: any = {
    systemInstruction: SYSTEM_INSTRUCTION,
    tools: tools.length > 0 ? tools : undefined,
  };

  if (useThinking) {
    config.thinkingConfig = { thinkingBudget: 32768 };
  }

  try {
    const chat = ai.chats.create({
      model: modelId,
      config: config,
      history: history,
    });

    const result = await chat.sendMessage({ message });
    
    // Extract sources if available
    const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks?.map((chunk: any) => chunk.web).filter((web: any) => web);

    return { 
      text: result.text || "No response generated.",
      sources
    };
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};

export const enhancePrompt = async (originalPrompt: string, style: string): Promise<string> => {
  const ai = getAI();
  const prompt = `Refine this AI image prompt to be production-ready, detailed, and visually stunning. 
  Target Style: ${style}.
  Original Prompt: "${originalPrompt}"
  
  Output ONLY the refined prompt text.`;

  const response = await ai.models.generateContent({
    model: MODELS.CHAT_SMART,
    contents: prompt,
    config: {
      systemInstruction: "You are an expert prompt engineer.",
    }
  });

  return response.text || "";
};

// --- Image Understanding ---

export const analyzeImageForDesign = async (base64Image: string, mimeType: string): Promise<string> => {
  const ai = getAI();
  const prompt = `Analyze this image as a professional designer. 
  Provide a structured breakdown:
  1. Composition & Perspective
  2. Color Palette & Lighting
  3. Style & Mood
  4. A high-quality AI prompt to recreate this image.`;

  const response = await ai.models.generateContent({
    model: MODELS.CHAT_SMART, // Gemini 3 Pro for understanding
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: prompt }
      ]
    }
  });

  return response.text || "";
};

// --- Image Generation & Editing ---

export const generateDesignImage = async (
  prompt: string, 
  aspectRatio: string, 
  resolution: string
): Promise<string> => {
  // Check key for Pro models
  if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
    await window.aistudio.openSelectKey();
  }
  
  const ai = getAI();
  // Using gemini-3-pro-image-preview
  const response = await ai.models.generateContent({
    model: MODELS.IMAGE_GEN_PRO,
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any, // "1:1" | "3:4" | "4:3" | "9:16" | "16:9"
        imageSize: resolution as any // "1K" | "2K" | "4K"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated.");
};

export const editDesignImage = async (
  base64Image: string, 
  mimeType: string, 
  editInstruction: string
): Promise<string> => {
  const ai = getAI();
  // Using gemini-2.5-flash-image for editing (Nano banana)
  const response = await ai.models.generateContent({
    model: MODELS.IMAGE_EDIT,
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: editInstruction }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No edited image returned.");
};

// --- Video Generation (Veo) ---

export const generateVeoVideo = async (
  prompt: string,
  aspectRatio: string,
  base64Image?: string,
  mimeType?: string
): Promise<string> => {
  // Veo requires paid key selection
  if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
    await window.aistudio.openSelectKey();
  }

  const ai = getAI();
  
  const contentsInput: any = {
    prompt: prompt
  };

  if (base64Image && mimeType) {
    contentsInput.image = {
      imageBytes: base64Image,
      mimeType: mimeType
    };
  }

  let operation = await ai.models.generateVideos({
    model: MODELS.VIDEO_VEO_FAST,
    ...contentsInput,
    config: {
      numberOfVideos: 1,
      aspectRatio: aspectRatio as any, // "16:9" | "9:16"
      resolution: '720p', 
    }
  });

  // Polling loop
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed.");

  // Fetch with API key
  const fetchResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
  const videoBlob = await fetchResponse.blob();
  return URL.createObjectURL(videoBlob);
};

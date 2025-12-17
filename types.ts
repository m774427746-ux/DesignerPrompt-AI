export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  IMAGE_STUDIO = 'IMAGE_STUDIO',
  VIDEO_STUDIO = 'VIDEO_STUDIO',
  PROMPT_LAB = 'PROMPT_LAB'
}

export enum ImageMode {
  GENERATE = 'GENERATE',
  EDIT = 'EDIT',
  ANALYZE = 'ANALYZE'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64
  isThinking?: boolean;
  sources?: Array<{ uri: string; title: string }>;
}

export interface ImageGenerationConfig {
  aspectRatio: string;
  resolution: string;
}

export interface VeoGenerationConfig {
  aspectRatio: string;
  resolution: '720p' | '1080p';
}

export interface AnalysisResult {
  composition: string;
  color: string;
  lighting: string;
  suggestedPrompt: string;
}

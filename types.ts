
export interface AnalysisResult {
  blurDetected: boolean;
  noiseLevel: 'low' | 'medium' | 'high';
  lightingIssue: 'under-exposed' | 'over-exposed' | 'none';
  pixelated: boolean;
  redEyeDetected?: boolean;
  summary: string;
}

export interface EnhancementConfig {
  sharpness: 'Low' | 'Medium' | 'High';
  colorIntensity: number;
  preserveIdentity: boolean;
  focusDistant: boolean;
  redEyeCorrection: boolean;
}

export type AppStage = 'upload' | 'analyzing' | 'enhancing' | 'result';

export interface ImageFile {
  file: File;
  preview: string;
  width: number;
  height: number;
  aspectRatio: number;
}

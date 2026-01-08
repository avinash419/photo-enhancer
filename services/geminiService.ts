import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, EnhancementConfig } from "../types.ts";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

const getSupportedAspectRatio = (ratio: number): "1:1" | "4:3" | "3:4" | "16:9" | "9:16" => {
  if (ratio > 1.5) return "16:9";
  if (ratio > 1.1) return "4:3";
  if (ratio > 0.8) return "1:1";
  if (ratio > 0.6) return "3:4";
  return "9:16";
};

export const analyzeImage = async (file: File): Promise<AnalysisResult> => {
  // Access API key at runtime inside the function
  const apiKey = (process.env as any).API_KEY;
  if (!apiKey) throw new Error("AI Engine offline: API Key not detected in environment.");
  
  const ai = new GoogleGenAI({ apiKey });
  const base64Data = await fileToBase64(file);

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data,
          },
        },
        {
          text: "Analyze this image for technical quality. Identify if it's blurry, pixelated, noisy, has red-eye issues (glowing red pupils), or has lighting issues. Respond in JSON format.",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          blurDetected: { type: Type.BOOLEAN },
          noiseLevel: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
          lightingIssue: { type: Type.STRING, enum: ['under-exposed', 'over-exposed', 'none'] },
          pixelated: { type: Type.BOOLEAN },
          redEyeDetected: { type: Type.BOOLEAN },
          summary: { type: Type.STRING },
        },
        required: ["blurDetected", "noiseLevel", "lightingIssue", "pixelated", "redEyeDetected", "summary"],
      },
    },
  });

  return JSON.parse(response.text || '{}') as AnalysisResult;
};

export const enhanceImage = async (
  file: File,
  config: EnhancementConfig,
  aspectRatioValue: number = 1
): Promise<string> => {
  const apiKey = (process.env as any).API_KEY;
  if (!apiKey) throw new Error("AI Engine offline: API Key not detected in environment.");
  
  const ai = new GoogleGenAI({ apiKey });
  const base64Data = await fileToBase64(file);
  const targetRatio = getSupportedAspectRatio(aspectRatioValue);

  const prompt = `
    TASK: SUBJECT-AWARE SUPER-RESOLUTION & PROGRESSIVE RECONSTRUCTION.
    
    1. SUBJECT IDENTIFICATION: Identify the main human subjects, including those that appear small or distant. 
    2. RED-EYE CORRECTION: ${config.redEyeCorrection ? 'Identify and correct any red-eye artifacts (glowing red pupils) found in subjects, neutralizing them to a natural dark pupil color while maintaining realistic eye highlights.' : 'Maintain natural eye colors.'}
    3. PROGRESSIVE RECONSTRUCTION: Apply progressive detail reconstruction. Instead of aggressive sharpening, increase clarity and resolution gradually to prevent pixel breakup when zoomed.
    4. ZOOM STABILITY: The final image must remain stable and detailed when zoomed in. If real detail cannot be recovered, prioritize realism and smooth texture over fake sharpness. Zoom stability > sharp look.
    5. FIDELITY & TEXTURE: Reconstruct natural textures for face, hair, clothing, and edges without inventing new details or changing identity.
    6. ARTIFACT REMOVAL: Reduce digital zoom artifacts, blocky pixels, and noise. Maintain smooth transitions between enhanced and non-enhanced areas.
    7. NATURAL LOOK: Do NOT use hard sharpening, artificial outlines, or edge halos. Preserve original proportions, facial structure, and realism.

    SETTINGS:
    - Target Sharpness Intent: ${config.sharpness}
    - Color Vibrance Level: ${config.colorIntensity}%
    - Focus on Distant/Small Subjects: ${config.focusDistant ? 'PRIORITY' : 'Standard'}
    - Red-Eye Fix: ${config.redEyeCorrection ? 'ACTIVE' : 'OFF'}
    - Identity Lock: ${config.preserveIdentity ? 'STRICT' : 'Standard'}

    OUTPUT: Return the enhanced version of the input image following these high-fidelity principles.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: targetRatio
      }
    }
  });

  let enhancedBase64 = '';
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      enhancedBase64 = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  if (!enhancedBase64) {
    throw new Error("Enhancement failed. Please try again with a different image.");
  }

  return enhancedBase64;
};

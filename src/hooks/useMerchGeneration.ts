import { useEffect, useState } from 'react';
import type { Product, Theme } from '../types/domain';
import { LOADING_MESSAGES } from '../lib/constants';
import { createGeminiClient } from '../lib/gemini';
import { buildMainPrompt, buildThemeSpecificPrompt } from '../lib/prompts';

interface GenerateOptions {
  product: Product | null;
  theme: Theme | null;
  customTheme: string;
  dogName: string;
  photo: string | null;
}

interface UseMerchGenerationResult {
  isGenerating: boolean;
  loadingMessage: string;
  error: string | null;
  resultImage: string | null;
  generateMerch: (options: GenerateOptions) => Promise<void>;
  refineMerch: (prompt: string) => Promise<void>;
  setResultImage: (value: string | null) => void;
  clearError: () => void;
}

export const useMerchGeneration = (): UseMerchGenerationResult => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  useEffect(() => {
    if (!isGenerating) return;

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[index]);
    }, 3000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  const generateMerch = async ({
    product,
    theme,
    customTheme,
    dogName,
    photo,
  }: GenerateOptions) => {
    const startTime = Date.now();
    setIsGenerating(true);
    setError(null);
    setResultImage(null);

    try {
      const ai = createGeminiClient();

      const themeSpecificPrompt = buildThemeSpecificPrompt(theme, customTheme);
      const prompt = buildMainPrompt({
        product,
        dogName,
        themePrompt: themeSpecificPrompt,
      });

      const parts: any[] = [{ text: prompt }];

      if (photo) {
        const [header, base64Data] = photo.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType,
          },
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
      });

      let generatedImageUrl: string | null = null;
      if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }
        }
      }

      if (!generatedImageUrl) {
        throw new Error('No image generated');
      }

      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - elapsed));
      }

      setResultImage(generatedImageUrl);
      setError(null);
    } catch (err: any) {
      let errorMessage =
        'Something went wrong in the studio 😔 Try again?';
      if (
        err?.message?.toLowerCase().includes('quota') ||
        err?.message?.toLowerCase().includes('rate limit')
      ) {
        errorMessage =
          "We're a little overwhelmed right now — try again in a moment 🐾";
      }
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const refineMerch = async (refinePrompt: string) => {
    if (!refinePrompt || !resultImage) return;

    setIsGenerating(true);
    setLoadingMessage('Refining your masterpiece...');

    try {
      const ai = createGeminiClient();
      const base64Data = resultImage.split(',')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/png' } },
            { text: refinePrompt },
          ],
        },
      });

      let refinedImageUrl: string | null = null;
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            refinedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (refinedImageUrl) {
        setResultImage(refinedImageUrl);
      }
    } catch (err) {
      console.error('Refinement failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearError = () => setError(null);

  return {
    isGenerating,
    loadingMessage,
    error,
    resultImage,
    generateMerch,
    refineMerch,
    setResultImage,
    clearError,
  };
};


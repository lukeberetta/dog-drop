/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Check, 
  ChevronRight, 
  RefreshCcw, 
  Download, 
  Dog, 
  Coffee, 
  Shirt, 
  ShoppingBag, 
  Smartphone,
  Palette,
  Sparkles,
  Camera,
  ArrowLeft,
  Send,
  CreditCard,
  Truck,
  ShieldCheck,
  X,
  Footprints,
  MessageSquare
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Howl } from 'howler';

// --- Types ---

type Product = 'Mug' | 'T-Shirt' | 'Hoodie' | 'Socks' | 'Tote Bag' | 'Phone Case';
type Style = 'None' | 'Cartoon' | 'Watercolor' | 'Pop Art' | 'Minimalist' | 'Oil Painting' | 'Sketch' | 'Cyberpunk';
type Theme = 
  | 'Ivy League' 
  | '90s New York' 
  | 'British Countryside' 
  | 'Parisian Maison' 
  | 'Italian Riviera' 
  | 'Tokyo Streets' 
  | 'Vintage Americana' 
  | 'LA Cool'
  | 'Custom';

interface AppState {
  step: number;
  photo: string | null;
  dogName: string;
  product: Product | null;
  theme: Theme | null;
  customTheme: string;
  resultImage: string | null;
  error: string | null;
  isGenerating: boolean;
  loadingMessage: string;
  showCheckout: boolean;
  showFeedback: boolean;
}

// --- Sounds ---

const sounds = {
  click: new Howl({ 
    src: ['https://actions.google.com/sounds/v1/buttons/button_click.ogg'], 
    volume: 0.5,
    onloaderror: () => console.warn('Click sound failed to load'),
    onplayerror: () => console.warn('Click sound failed to play')
  }),
  upload: new Howl({ 
    src: ['https://actions.google.com/sounds/v1/buttons/simple_button_confirm.ogg'], 
    volume: 0.5,
    onloaderror: () => console.warn('Upload sound failed to load'),
    onplayerror: () => console.warn('Upload sound failed to play')
  }),
  success: new Howl({ 
    src: ['https://actions.google.com/sounds/v1/cartoon/clink_clank.ogg'], 
    volume: 0.6,
    onloaderror: () => console.warn('Success sound failed to load'),
    onplayerror: () => console.warn('Success sound failed to play')
  }),
};

const playSound = (type: keyof typeof sounds) => {
  sounds[type].play();
};

// --- Constants ---

const PRODUCTS: { id: Product; icon: React.ReactNode; price: string }[] = [
  { id: 'Mug', icon: <Coffee className="w-12 h-12" />, price: '$18.00' },
  { id: 'T-Shirt', icon: <Shirt className="w-12 h-12" />, price: '$24.00' },
  { id: 'Hoodie', icon: <Shirt className="w-12 h-12" />, price: '$45.00' },
  { id: 'Socks', icon: <Footprints className="w-12 h-12" />, price: '$15.00' },
  { id: 'Tote Bag', icon: <ShoppingBag className="w-12 h-12" />, price: '$22.00' },
  { id: 'Phone Case', icon: <Smartphone className="w-12 h-12" />, price: '$20.00' },
];

const STYLES: Style[] = [
  'None', 'Cartoon', 'Watercolor', 'Pop Art', 'Minimalist', 'Oil Painting', 'Sketch', 'Cyberpunk'
];

const THEMES: { id: Theme; label: string; description: string }[] = [
  { id: 'Ivy League', label: 'Ivy League', description: 'Circular emblem with laurel wreath framing. Navy, forest green, aged cream palette. Dog rendered as embroidered mascot in blazer. Clean collegiate block typography.' },
  { id: '90s New York', label: '90s New York', description: 'Bold screen-print style, high contrast. Black, red, and white only. Dog rendered as flat graphic. Gritty, urban, raw placement.' },
  { id: 'British Countryside', label: 'British Countryside', description: 'Rectangular hunt club patch aesthetic. Olive, burgundy, tan, dark brown palette. Dog rendered in detailed oil painting style, side profile. Thin serif typography.' },
  { id: 'Parisian Maison', label: 'Parisian Maison', description: 'Single delicate line drawing of the dog, no fill, just outline. Black ink on cream. Placed small and off-center, like a couture house sketch.' },
  { id: 'Italian Riviera', label: 'Italian Riviera', description: 'Vintage travel poster aesthetic. Warm terracotta, cobalt blue, sun yellow palette. Dog rendered as retro illustrated character. Slightly faded, sun-bleached feel.' },
  { id: 'Tokyo Streets', label: 'Tokyo Streets', description: 'Layered graphic, bold and asymmetric composition. High contrast — black, white, one accent color. Dog rendered in bold graphic novel / manga-influenced style.' },
  { id: 'Vintage Americana', label: 'Vintage Americana', description: 'Worn, distressed print feel. Faded red, white, and indigo palette. Dog as retro workwear patch or western badge. Cracked texture.' },
  { id: 'LA Cool', label: 'LA Cool', description: 'Effortless, barely-there graphic. Sun-bleached sage, dusty rose, or washed grey palette. Dog as loose gestural sketch. Small placement, chest or corner.' },
  { id: 'Custom', label: 'Custom', description: 'Describe your own unique brand aesthetic' },
];

const LOADING_MESSAGES = [
  "Scouting locations for the campaign shoot...",
  "Briefing the creative director...",
  "Your pup is in hair and makeup...",
  "Calling in a few favors at Fashion Week...",
  "The atelier is working on your piece...",
  "Negotiating the collab deal...",
  "Sourcing the finest materials...",
  "The design team is arguing about kerning...",
  "Your dog's agent is reviewing the contract...",
  "Pulling looks from the archive...",
  "The photographer is setting up the studio...",
  "Almost ready for the drop...",
];

// --- Components ---

export default function App() {
  const [state, setState] = useState<AppState>({
    step: 0,
    photo: null,
    dogName: '',
    product: null,
    theme: null,
    customTheme: '',
    resultImage: null,
    error: null,
    isGenerating: false,
    loadingMessage: LOADING_MESSAGES[0],
    showCheckout: false,
    showFeedback: false,
  });

  const [refinePrompt, setRefinePrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---

  useEffect(() => {
    if (state.isGenerating) {
      let index = 0;
      const interval = setInterval(() => {
        index = (index + 1) % LOADING_MESSAGES.length;
        setState(prev => ({ ...prev, loadingMessage: LOADING_MESSAGES[index] }));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [state.isGenerating]);

  // --- Handlers ---

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ ...prev, photo: reader.result as string }));
        playSound('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
    playSound('click');
    setState(prev => ({ ...prev, step: prev.step + 1 }));
  };

  const prevStep = () => {
    playSound('click');
    setState(prev => ({ ...prev, step: Math.max(0, prev.step - 1) }));
  };

  const generateMerch = async () => {
    playSound('click');
    setState(prev => ({ ...prev, step: 4, isGenerating: true, error: null, resultImage: null }));
    
    const startTime = Date.now();

    try {
      console.log("Starting generation process...");
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("GEMINI_API_KEY is missing!");
        throw new Error("API Key missing");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const selectedTheme = THEMES.find(t => t.id === state.theme);
      let themeSpecificPrompt = "";
      
      if (state.theme === 'Ivy League') {
        themeSpecificPrompt = `
          STYLE: Circular emblem with laurel wreath framing.
          PALETTE: Navy blue, forest green, and aged cream.
          DOG RENDERING: The dog should look like a high-quality embroidered mascot wearing a small navy blazer.
          TYPOGRAPHY: Clean collegiate block typography.
        `;
      } else if (state.theme === '90s New York') {
        themeSpecificPrompt = `
          STYLE: Bold screen-print style, high contrast, raw and gritty.
          PALETTE: Strictly Black, Red, and White only.
          DOG RENDERING: Flat graphic illustration, reminiscent of a Supreme box logo or Futura-style street art.
          COMPOSITION: No decorative framing, raw placement on the garment.
        `;
      } else if (state.theme === 'British Countryside') {
        themeSpecificPrompt = `
          STYLE: Rectangular hunt club patch aesthetic.
          PALETTE: Olive green, burgundy, tan, and dark brown.
          DOG RENDERING: Detailed oil painting style, rendered in a side profile (stately and noble).
          TYPOGRAPHY: Thin, restrained serif typography.
        `;
      } else if (state.theme === 'Parisian Maison') {
        themeSpecificPrompt = `
          STYLE: Single delicate line drawing (outline only), no fill.
          PALETTE: Black ink on a cream-colored product.
          COMPOSITION: Placed small and off-center (e.g., chest pocket area), like a couture house sketch (Maison Margiela or Jacquemus style).
        `;
      } else if (state.theme === 'Italian Riviera') {
        themeSpecificPrompt = `
          STYLE: Vintage travel poster aesthetic.
          PALETTE: Warm terracotta, cobalt blue, and sun yellow.
          DOG RENDERING: Retro illustrated character with a slightly faded, sun-bleached feel.
        `;
      } else if (state.theme === 'Tokyo Streets') {
        themeSpecificPrompt = `
          STYLE: Layered graphic, bold and asymmetric composition.
          PALETTE: High contrast Black and White with one sharp accent color.
          DOG RENDERING: Bold graphic novel or manga-influenced style (Neighborhood or Undercover aesthetic).
        `;
      } else if (state.theme === 'Vintage Americana') {
        themeSpecificPrompt = `
          STYLE: Worn, distressed print with a cracked texture (like an old band tee).
          PALETTE: Faded red, off-white, and indigo blue.
          DOG RENDERING: Retro workwear patch or western-style badge.
        `;
      } else if (state.theme === 'LA Cool') {
        themeSpecificPrompt = `
          STYLE: Effortless, barely-there minimal graphic.
          PALETTE: Sun-bleached sage, dusty rose, or washed grey.
          DOG RENDERING: Loose gestural sketch with minimal detail.
          COMPOSITION: Small placement on the chest or corner, not centered (Lady White Co aesthetic).
        `;
      } else if (state.theme === 'Custom') {
        themeSpecificPrompt = `Vibe: ${state.customTheme}`;
      }

      const prompt = `
        High-end streetwear collaboration aesthetic (Aimé Leon Dore, Kith, Palace). 
        Product: ${state.product}.
        Subject: A dog named ${state.dogName || 'the pup'} reimagined as a sophisticated brand mascot.
        
        THEME SPECIFICS:
        ${themeSpecificPrompt}
        
        Product Rendering Requirements:
        - Pure white background (#FFFFFF).
        - Front-facing, perfectly straight on, ghost mannequin style.
        - Symmetrical, no rotation or tilt.
        - Product appears unworn and pristine, floating on white.
        - Shot as if for an e-commerce listing on a premium fashion brand's website (Reference: Aimé Leon Dore, Sporty & Rich, Filling Pieces).
        - Isolated product only. No lifestyle photography. No flat lay. No model.
        - No shadows, no surface texture, no floor or table visible.
        - Every product should look like it comes from a premium streetwear brand.
        - No bright white products — use aged cream, washed off-white, pigment-dyed, or muted tones.
        - Products should look heavyweight, substantial, and well-constructed.
        - The product itself should look covetable and high-quality.
        
        T-SHIRT SPECIFIC RULES:
        - If the product is a T-shirt, it must be an oversized fit with drop shoulders (not a standard fitted cut).
        - Fabric must look like heavyweight cotton with a slight visible texture.
        
        Design Principles:
        - Use generous negative space and a clean, minimalist layout.
        - Muted, sophisticated color palette: cream, forest green, navy, tan, and off-white.
        - The dog should look like an embroidered patch, a vintage sports team graphic, or a luxury brand logo.
        
        CRITICAL TEXT RULE — override all other instructions:
        - If no dog name is provided by the user, the design must contain ZERO text, ZERO letters, ZERO words, ZERO numbers.
        - "THE PUP", "PUP", "DOG", or any generic placeholder is strictly forbidden.
        - Silence is better than a placeholder — leave the space empty.
        - The design must work as a purely visual, text-free graphic.
        - Only render text if a specific dog name has been explicitly passed into this prompt as [DOG NAME].
        - [DOG NAME]: "${state.dogName || 'NONE'}".
        - If [DOG NAME] is "NONE", the design MUST be 100% text-free.
        - If [DOG NAME] is provided, include it once in clean block or collegiate typography — spell it exactly as provided, character by character.
        - Do NOT include numbers, years, random letters, abbreviations, or any decorative text elements.
        - Do NOT include circular text, arched text, or text around the border of any emblem or crest.
        - Do NOT attempt to render any text that is not the dog's exact name.
        
        CRITICAL: NO glitter, NO neon, NO hearts, NO sparkle effects, NO drop shadows, NO novelty pet gift aesthetic. 
        The final result must look like a premium, fashion-forward limited edition garment.
      `.trim();

      const parts: any[] = [
        { text: prompt }
      ];

      if (state.photo) {
        console.log("Including user photo in request...");
        const [header, base64Data] = state.photo.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
      }

      console.log("Requesting content from Gemini (gemini-2.5-flash-image)...");
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
      });

      console.log("Response received from Gemini:", response);

      let generatedImageUrl = null;
      if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        console.log("Finish Reason:", candidate.finishReason);
        
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
              console.log("Successfully extracted image data from response.");
              break;
            }
          }
        }
      }

      if (!generatedImageUrl) {
        console.warn("No image was generated. This might be due to safety filters or model limitations.");
        throw new Error("No image generated");
      }

      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise(resolve => setTimeout(resolve, 3000 - elapsed));
      }

      playSound('success');
      setState(prev => ({ 
        ...prev, 
        step: 5, 
        isGenerating: false, 
        resultImage: generatedImageUrl,
        error: null
      }));
    } catch (error: any) {
      console.error("Generation failed with error:", error);
      
      let errorMessage = "Something went wrong in the studio 😔 Try again?";
      if (error?.message?.toLowerCase().includes('quota') || error?.message?.toLowerCase().includes('rate limit')) {
        errorMessage = "We're a little overwhelmed right now — try again in a moment 🐾";
      }

      setState(prev => ({ 
        ...prev, 
        step: 5, 
        isGenerating: false, 
        resultImage: null,
        error: errorMessage
      }));
    }
  };

  const handleRefine = async () => {
    if (!refinePrompt || !state.resultImage) return;
    playSound('click');
    setState(prev => ({ ...prev, isGenerating: true, loadingMessage: "Refining your masterpiece..." }));
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const base64Data = state.resultImage.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: "image/png" } },
            { text: refinePrompt }
          ]
        },
      });

      let refinedImageUrl = null;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          refinedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (refinedImageUrl) {
        playSound('success');
        setState(prev => ({ ...prev, resultImage: refinedImageUrl }));
      }
      setRefinePrompt('');
    } catch (error) {
      console.error("Refinement failed:", error);
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const reset = () => {
    playSound('click');
    setState(prev => ({
      ...prev,
      step: 1,
      product: null,
      theme: null,
      customTheme: '',
      resultImage: null,
      error: null,
      isGenerating: false,
      loadingMessage: LOADING_MESSAGES[0],
      showCheckout: false,
    }));
  };

  // --- Render Helpers ---

  const renderProgress = () => {
    if (state.step === 0 || state.step > 4) return null;
    return (
      <div className="w-full max-w-md mx-auto mb-8 px-4">
        <div className="flex justify-between mb-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                state.step >= s ? 'bg-brand-coral text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              {state.step > s ? <Check className="w-5 h-5" /> : s}
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-brand-coral"
            initial={{ width: 0 }}
            animate={{ width: `${(Math.min(state.step, 3) / 3) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6">
      <header className="mb-8 text-center">
        <h1 
          onClick={() => setState(prev => ({ ...prev, step: 0 }))}
          className="text-4xl font-bold text-brand-brown flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Dog className="text-brand-coral w-10 h-10" />
          Dog Drop
        </h1>
        <p className="text-brand-brown/60 font-medium">Custom pup merch in seconds</p>
      </header>

      {renderProgress()}

      <main className="w-full max-w-2xl flex-1 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {state.step === 0 && (
            <motion.div 
              key="step0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center text-center py-12"
            >
              <motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="bg-brand-coral p-10 rounded-[3rem] shadow-2xl mb-12 relative"
              >
                <Dog className="w-32 h-32 text-white" />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-brand-brown text-white p-4 rounded-full shadow-lg"
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
              </motion.div>

              <h2 className="text-5xl sm:text-6xl font-black text-brand-brown mb-6 tracking-tight leading-tight">
                Limited Edition Merch.<br />
                <span className="text-brand-coral">Starring Your Dog.</span>
              </h2>
              
              <p className="text-xl text-brand-brown/60 mb-12 max-w-lg font-medium leading-relaxed">
                Turn your pup into a high-end streetwear icon. 
                Custom mascots, varsity crests, and premium apparel in seconds.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <button
                  onClick={nextStep}
                  className="flex-1 bg-brand-brown text-white px-10 py-6 rounded-3xl font-bold text-xl shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 group"
                >
                  Start Your Drop
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="mt-16 grid grid-cols-3 gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                <div className="flex flex-col items-center gap-2">
                  <Shirt className="w-8 h-8" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Apparel</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Coffee className="w-8 h-8" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Lifestyle</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Smartphone className="w-8 h-8" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Tech</span>
                </div>
              </div>
            </motion.div>
          )}

          {state.step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center"
            >
              <div 
                onClick={() => {
                  playSound('click');
                  fileInputRef.current?.click();
                }}
                className="w-full aspect-square max-w-md border-4 border-dashed border-brand-coral/30 rounded-3xl bg-white flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-brand-coral/5 transition-colors group relative overflow-hidden"
              >
                {state.photo ? (
                  <div className="relative w-full h-full">
                    <img src={state.photo} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                        <Check className="w-6 h-6" />
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          playSound('click');
                          setState(prev => ({ ...prev, photo: null }));
                        }}
                        className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-brand-coral/10 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                      <Dog className="w-20 h-20 text-brand-coral" />
                    </div>
                    <p className="text-xl font-bold text-brand-brown mb-2 text-center">Drop your dog's photo here 🐾</p>
                    <p className="text-brand-brown/50 mb-6">Or tap to browse</p>
                    <button className="bg-brand-coral text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-brand-orange transition-colors">
                      Choose Photo
                    </button>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <div className="mt-8 w-full max-w-md">
                <label className="block text-sm font-bold text-brand-brown/60 mb-2 uppercase tracking-wider">Dog's Name (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Buddy"
                  value={state.dogName}
                  onChange={(e) => setState(prev => ({ ...prev, dogName: e.target.value }))}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-brand-coral outline-none text-lg font-medium transition-all"
                />
              </div>

              <div className="flex flex-col items-center gap-4 mt-8 w-full">
                {state.photo && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={nextStep}
                    className="bg-brand-brown text-white px-12 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-black transition-all flex items-center gap-2"
                  >
                    Next Step <ChevronRight className="w-5 h-5" />
                  </motion.button>
                )}
                <button onClick={prevStep} className="text-brand-brown/50 font-bold flex items-center gap-2 hover:text-brand-brown transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
              </div>
            </motion.div>
          )}

          {state.step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full"
            >
              <h2 className="text-3xl font-bold text-center mb-8">What should we put your pup on?</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {PRODUCTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      playSound('click');
                      setState(prev => ({ ...prev, product: p.id }));
                    }}
                    className={`bg-white p-6 rounded-3xl shadow-sm border-4 transition-all flex flex-col items-center gap-4 hover:shadow-md ${
                      state.product === p.id ? 'border-brand-coral scale-105' : 'border-transparent'
                    }`}
                  >
                    <div className="text-brand-coral">{p.icon}</div>
                    <div className="text-center">
                      <span className="font-bold text-lg block">{p.id}</span>
                      <span className="text-sm text-brand-brown/50 font-medium">{p.price}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex flex-col items-center gap-4 mt-8">
                {state.product && (
                  <button
                    onClick={nextStep}
                    className="bg-brand-brown text-white px-12 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-black transition-all flex items-center gap-2"
                  >
                    Next Step <ChevronRight className="w-5 h-5" />
                  </button>
                )}
                <button onClick={prevStep} className="text-brand-brown/50 font-bold flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
              </div>
            </motion.div>
          )}

          {state.step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full"
            >
              <h2 className="text-3xl font-bold text-center mb-8">Pick a vibe</h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      playSound('click');
                      setState(prev => ({ ...prev, theme: t.id }));
                    }}
                    className={`bg-white p-6 rounded-3xl shadow-sm border-4 transition-all flex flex-col items-center justify-center text-center gap-2 hover:shadow-md min-h-[100px] ${
                      state.theme === t.id ? 'border-brand-coral scale-105' : 'border-transparent'
                    }`}
                  >
                    <span className="font-bold text-lg leading-tight">{t.label}</span>
                  </button>
                ))}
              </div>

              {state.theme === 'Custom' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 w-full max-w-md mx-auto"
                >
                  <label className="block text-sm font-bold text-brand-brown/60 mb-2 uppercase tracking-wider">Describe your vibe</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Cyberpunk Samurai or Space Pirate"
                    value={state.customTheme}
                    onChange={(e) => setState(prev => ({ ...prev, customTheme: e.target.value }))}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-brand-coral outline-none text-lg font-medium transition-all"
                  />
                </motion.div>
              )}

              <div className="flex flex-col items-center gap-4 mt-8">
                {state.theme && (state.theme !== 'Custom' || state.customTheme.trim() !== '') && (
                  <button
                    onClick={generateMerch}
                    className="bg-brand-coral text-white px-12 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-brand-orange transition-all flex items-center gap-2"
                  >
                    Generate <Sparkles className="w-5 h-5" />
                  </button>
                )}
                <button onClick={prevStep} className="text-brand-brown/50 font-bold flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
              </div>
            </motion.div>
          )}

          {state.step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-brand-cream z-50 flex flex-col items-center justify-center p-8 text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-8"
              >
                <div className="bg-brand-coral p-8 rounded-full shadow-2xl">
                  <Dog className="w-24 h-24 text-white" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold text-brand-brown mb-4 h-8">
                {state.loadingMessage}
              </h2>
              <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mb-8">
                <motion.div 
                  className="h-full bg-brand-coral"
                  animate={{ x: [-256, 256] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <button 
                onClick={() => setState(prev => ({ ...prev, step: 3, isGenerating: false }))}
                className="text-brand-brown/40 font-bold hover:text-brand-brown transition-colors"
              >
                Cancel Generation
              </button>
            </motion.div>
          )}

          {state.step === 5 && (state.resultImage || state.error) && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center"
            >
              {state.error ? (
                <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-12 flex flex-col items-center text-center">
                  <div className="bg-red-50 p-6 rounded-full mb-6">
                    <RefreshCcw className="w-16 h-16 text-brand-coral" />
                  </div>
                  <h2 className="text-2xl font-bold text-brand-brown mb-8">
                    {state.error}
                  </h2>
                  <button 
                    onClick={generateMerch}
                    className="w-full bg-brand-coral text-white py-5 rounded-2xl font-bold text-xl shadow-lg hover:bg-brand-orange transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCcw className="w-6 h-6" /> Try Again
                  </button>
                  <button 
                    onClick={reset}
                    className="mt-4 text-brand-brown/40 font-bold hover:text-brand-brown transition-colors"
                  >
                    Start Over
                  </button>
                </div>
              ) : (
                <>
                  {state.dogName && (
                    <h2 className="text-3xl font-bold mb-6 text-brand-brown">
                      {state.dogName}'s Masterpiece
                    </h2>
                  )}
                  
                  <div className="relative w-full max-w-md aspect-square bg-white rounded-[2rem] shadow-2xl p-4 mb-8 overflow-hidden group">
                    <img 
                      src={state.resultImage!} 
                      alt="Result" 
                      className="w-full h-full object-contain rounded-2xl"
                    />
                    {state.isGenerating && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                        <RefreshCcw className="w-12 h-12 text-brand-coral animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="w-full max-w-md space-y-4">
                    <button 
                      onClick={() => {
                        playSound('click');
                        setState(prev => ({ ...prev, showCheckout: true }));
                      }}
                      className="w-full bg-brand-brown text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all text-xl"
                    >
                      <ShoppingBag className="w-6 h-6" /> Get This {state.product}
                    </button>

                    <div className="flex gap-4">
                      <a 
                        href={state.resultImage!} 
                        download={`${state.dogName || 'dog'}-merch.png`}
                        onClick={() => playSound('click')}
                        className="flex-1 bg-brand-coral text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-brand-orange transition-all"
                      >
                        <Download className="w-5 h-5" /> Download
                      </a>
                      <button 
                        onClick={reset}
                        className="flex-1 bg-white border-2 border-brand-brown text-brand-brown py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                      >
                        <RefreshCcw className="w-5 h-5" /> Start Over
                      </button>
                    </div>

                    <div className="pt-6 border-t border-brand-brown/10">
                      <p className="text-sm font-bold text-brand-brown/60 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-coral" /> Want to change something?
                      </p>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="e.g. Add a retro filter or make it blue"
                          value={refinePrompt}
                          onChange={(e) => setRefinePrompt(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                          className="w-full pl-6 pr-14 py-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-brand-coral outline-none font-medium transition-all"
                        />
                        <button 
                          onClick={handleRefine}
                          disabled={!refinePrompt || state.isGenerating}
                          className="absolute right-2 top-2 bottom-2 aspect-square bg-brand-brown text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-black transition-all"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!state.error && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        top: -20, 
                        left: `${Math.random() * 100}%`,
                        rotate: 0,
                        scale: Math.random() * 0.5 + 0.5
                      }}
                      animate={{ 
                        top: '120%',
                        rotate: 360,
                      }}
                      transition={{ 
                        duration: Math.random() * 2 + 2,
                        repeat: Infinity,
                        delay: Math.random() * 5
                      }}
                      className="absolute w-4 h-4 rounded-sm"
                      style={{ 
                        backgroundColor: ['#FF7F50', '#FF6347', '#4A3728', '#FDFCF8'][i % 4] 
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Checkout Modal */}
      <AnimatePresence>
        {state.showCheckout && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-brand-cream w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => {
                  playSound('click');
                  setState(prev => ({ ...prev, showCheckout: false }));
                }}
                className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-all z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="text-brand-coral" /> Checkout
                </h3>

                <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 flex items-center gap-4">
                  <img src={state.resultImage!} className="w-20 h-20 object-cover rounded-xl" alt="Preview" />
                  <div>
                    <p className="font-bold text-lg">{state.product}</p>
                    <p className="text-brand-brown/50">{state.dogName || 'Custom Pup'} Design</p>
                    <p className="text-brand-coral font-bold mt-1">
                      {PRODUCTS.find(p => p.id === state.product)?.price}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-brand-brown/70">
                    <Truck className="w-5 h-5 text-brand-coral" />
                    <span className="text-sm font-medium">Free Shipping (3-5 business days)</span>
                  </div>
                  <div className="flex items-center gap-3 text-brand-brown/70">
                    <ShieldCheck className="w-5 h-5 text-brand-coral" />
                    <span className="text-sm font-medium">Secure Payment & Quality Guarantee</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    playSound('success');
                    alert("Order placed! (Demo only)");
                    setState(prev => ({ ...prev, showCheckout: false }));
                  }}
                  className="w-full bg-brand-coral text-white py-5 rounded-2xl font-bold text-xl shadow-lg hover:bg-brand-orange transition-all flex items-center justify-center gap-2"
                >
                  Confirm Order
                </button>
                <p className="text-center text-xs text-brand-brown/30 mt-4 uppercase tracking-widest">
                  No real payment will be taken
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-12 flex flex-col items-center gap-4">
        <button 
          onClick={() => {
            playSound('click');
            setState(prev => ({ ...prev, showFeedback: true }));
          }}
          className="text-brand-brown/40 hover:text-brand-coral transition-colors flex items-center gap-2 font-bold text-sm uppercase tracking-widest"
        >
          <MessageSquare className="w-4 h-4" /> Share Feedback
        </button>
        <div className="text-brand-brown/30 text-xs font-medium uppercase tracking-widest">
          Made with ❤️ for Dog Lovers
        </div>
      </footer>

      {/* Feedback Modal */}
      <AnimatePresence>
        {state.showFeedback && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-brand-cream w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative p-8"
            >
              <button 
                onClick={() => {
                  playSound('click');
                  setState(prev => ({ ...prev, showFeedback: false }));
                }}
                className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-all z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MessageSquare className="text-brand-coral" /> Share Feedback
              </h3>

              <p className="text-brand-brown/60 mb-6 font-medium">
                How's your experience in the studio? We'd love to hear your thoughts on the designs and the process!
              </p>

              <textarea 
                placeholder="Your thoughts..."
                className="w-full h-32 px-6 py-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-brand-coral outline-none font-medium transition-all mb-6 resize-none"
              />

              <button 
                onClick={() => {
                  playSound('success');
                  alert("Thanks for your feedback! (Demo only)");
                  setState(prev => ({ ...prev, showFeedback: false }));
                }}
                className="w-full bg-brand-coral text-white py-5 rounded-2xl font-bold text-xl shadow-lg hover:bg-brand-orange transition-all flex items-center justify-center gap-2"
              >
                Send Feedback
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

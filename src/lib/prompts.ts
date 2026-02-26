import type { Product, Theme } from '../types/domain';
import { THEMES } from './constants';

export const buildThemeSpecificPrompt = (theme: Theme | null, customTheme: string) => {
  if (!theme) return '';

  if (theme === 'Ivy League') {
    return `
STYLE: Circular emblem with laurel wreath framing.
PALETTE: Navy blue, forest green, and aged cream.
DOG RENDERING: The dog should look like a high-quality embroidered mascot wearing a small navy blazer.
TYPOGRAPHY: Clean collegiate block typography.
    `.trim();
  }

  if (theme === '90s New York') {
    return `
STYLE: Bold screen-print style, high contrast, raw and gritty.
PALETTE: Strictly Black, Red, and White only.
DOG RENDERING: Flat graphic illustration, reminiscent of a Supreme box logo or Futura-style street art.
COMPOSITION: No decorative framing, raw placement on the garment.
    `.trim();
  }

  if (theme === 'British Countryside') {
    return `
STYLE: Rectangular hunt club patch aesthetic.
PALETTE: Olive green, burgundy, tan, and dark brown.
DOG RENDERING: Detailed oil painting style, rendered in a side profile (stately and noble).
TYPOGRAPHY: Thin, restrained serif typography.
    `.trim();
  }

  if (theme === 'Parisian Maison') {
    return `
STYLE: Single delicate line drawing (outline only), no fill.
PALETTE: Black ink on a cream-colored product.
COMPOSITION: Placed small and off-center (e.g., chest pocket area), like a couture house sketch (Maison Margiela or Jacquemus style).
    `.trim();
  }

  if (theme === 'Italian Riviera') {
    return `
STYLE: Vintage travel poster aesthetic.
PALETTE: Warm terracotta, cobalt blue, and sun yellow.
DOG RENDERING: Retro illustrated character with a slightly faded, sun-bleached feel.
    `.trim();
  }

  if (theme === 'Tokyo Streets') {
    return `
STYLE: Layered graphic, bold and asymmetric composition.
PALETTE: High contrast Black and White with one sharp accent color.
DOG RENDERING: Bold graphic novel or manga-influenced style (Neighborhood or Undercover aesthetic).
    `.trim();
  }

  if (theme === 'Vintage Americana') {
    return `
STYLE: Worn, distressed print with a cracked texture (like an old band tee).
PALETTE: Faded red, off-white, and indigo blue.
DOG RENDERING: Retro workwear patch or western-style badge.
    `.trim();
  }

  if (theme === 'LA Cool') {
    return `
STYLE: Effortless, barely-there minimal graphic.
PALETTE: Sun-bleached sage, dusty rose, or washed grey.
DOG RENDERING: Loose gestural sketch with minimal detail.
COMPOSITION: Small placement on the chest or corner, not centered (Lady White Co aesthetic).
    `.trim();
  }

  if (theme === 'Custom') {
    return `Vibe: ${customTheme}`.trim();
  }

  const selectedTheme = THEMES.find((t) => t.id === theme);
  return selectedTheme?.description ?? '';
};

export const buildMainPrompt = (options: {
  product: Product | null;
  dogName: string;
  themePrompt: string;
}) => {
  const { product, dogName, themePrompt } = options;

  return `
High-end streetwear collaboration aesthetic (Aimé Leon Dore, Kith, Palace). 
Product: ${product}.
Subject: A dog named ${dogName || 'the pup'} reimagined as a sophisticated brand mascot.

THEME SPECIFICS:
${themePrompt}

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
- [DOG NAME]: "${dogName || 'NONE'}".
- If [DOG NAME] is "NONE", the design MUST be 100% text-free.
- If [DOG NAME] is provided, include it once in clean block or collegiate typography — spell it exactly as provided, character by character.
- Do NOT include numbers, years, random letters, abbreviations, or any decorative text elements.
- Do NOT include circular text, arched text, or text around the border of any emblem or crest.
- Do NOT attempt to render any text that is not the dog's exact name.

CRITICAL: NO glitter, NO neon, NO hearts, NO sparkle effects, NO drop shadows, NO novelty pet gift aesthetic. 
The final result must look like a premium, fashion-forward limited edition garment.
  `.trim();
};


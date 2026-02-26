import type { LucideIcon } from 'lucide-react';
import { Coffee, Shirt, ShoppingBag, Smartphone, Footprints } from 'lucide-react';
import type { Product, Theme } from '../types/domain';

export const PRODUCTS: { id: Product; icon: LucideIcon; price: string }[] = [
  { id: 'Mug', icon: Coffee, price: '$18.00' },
  { id: 'T-Shirt', icon: Shirt, price: '$24.00' },
  { id: 'Hoodie', icon: Shirt, price: '$45.00' },
  { id: 'Socks', icon: Footprints, price: '$15.00' },
  { id: 'Tote Bag', icon: ShoppingBag, price: '$22.00' },
  { id: 'Phone Case', icon: Smartphone, price: '$20.00' },
];

export const THEMES: { id: Theme; label: string; description: string }[] = [
  {
    id: 'Ivy League',
    label: 'Ivy League',
    description:
      'Circular emblem with laurel wreath framing. Navy, forest green, aged cream palette. Dog rendered as embroidered mascot in blazer. Clean collegiate block typography.',
  },
  {
    id: '90s New York',
    label: '90s New York',
    description:
      'Bold screen-print style, high contrast. Black, red, and white only. Dog rendered as flat graphic. Gritty, urban, raw placement.',
  },
  {
    id: 'British Countryside',
    label: 'British Countryside',
    description:
      'Rectangular hunt club patch aesthetic. Olive, burgundy, tan, dark brown palette. Dog rendered in detailed oil painting style, side profile. Thin serif typography.',
  },
  {
    id: 'Parisian Maison',
    label: 'Parisian Maison',
    description:
      'Single delicate line drawing of the dog, no fill, just outline. Black ink on cream. Placed small and off-center, like a couture house sketch.',
  },
  {
    id: 'Italian Riviera',
    label: 'Italian Riviera',
    description:
      'Vintage travel poster aesthetic. Warm terracotta, cobalt blue, sun yellow palette. Dog rendered as retro illustrated character. Slightly faded, sun-bleached feel.',
  },
  {
    id: 'Tokyo Streets',
    label: 'Tokyo Streets',
    description:
      'Layered graphic, bold and asymmetric composition. High contrast — black, white, one accent color. Dog rendered in bold graphic novel / manga-influenced style.',
  },
  {
    id: 'Vintage Americana',
    label: 'Vintage Americana',
    description:
      'Worn, distressed print feel. Faded red, white, and indigo palette. Dog as retro workwear patch or western badge. Cracked texture.',
  },
  {
    id: 'LA Cool',
    label: 'LA Cool',
    description:
      'Effortless, barely-there graphic. Sun-bleached sage, dusty rose, or washed grey palette. Dog as loose gestural sketch. Small placement, chest or corner.',
  },
  {
    id: 'Custom',
    label: 'Custom',
    description: 'Describe your own unique brand aesthetic',
  },
];

export const LOADING_MESSAGES = [
  'Scouting locations for the campaign shoot...',
  'Briefing the creative director...',
  'Your pup is in hair and makeup...',
  'Calling in a few favors at Fashion Week...',
  'The atelier is working on your piece...',
  'Negotiating the collab deal...',
  'Sourcing the finest materials...',
  'The design team is arguing about kerning...',
  "Your dog's agent is reviewing the contract...",
  'Pulling looks from the archive...',
  'The photographer is setting up the studio...',
  'Almost ready for the drop...',
];


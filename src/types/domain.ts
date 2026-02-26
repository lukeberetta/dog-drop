export type Product = 'Mug' | 'T-Shirt' | 'Hoodie' | 'Socks' | 'Tote Bag' | 'Phone Case';

export type Theme =
  | 'Ivy League'
  | '90s New York'
  | 'British Countryside'
  | 'Parisian Maison'
  | 'Italian Riviera'
  | 'Tokyo Streets'
  | 'Vintage Americana'
  | 'LA Cool'
  | 'Custom';

export interface AppState {
  step: number;
  photo: string | null;
  dogName: string;
  product: Product | null;
  theme: Theme | null;
  customTheme: string;
  showCheckout: boolean;
  showFeedback: boolean;
}


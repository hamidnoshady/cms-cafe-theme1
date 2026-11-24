export interface ModifierOption {
  sourceId: string;
  label: string;
  priceDelta: number;
  priceLabel: string;
  menuOrder: number;
}

export interface ModifierGroup {
  sourceId: string;
  label: string;
  minSelections: number;
  maxSelections: number;
  menuOrder: number;
  options: ModifierOption[];
}

export interface ProductView {
  id: string;
  title: string;
  slug: string;
  href: string;
  num: string;
  category: string;
  summary: string;
  description: string;
  price: string;
  priceMinor: number;
  stock: number | null;
  state: 'available' | 'sold_out' | 'unavailable';
  canBuy: boolean;
  modifiers: ModifierGroup[];
  usesCart: boolean;
}

export interface ThemeStrings {
  [key: string]: string;
}

export interface ThemeData {
  locale: string;
  defaultLocale: string;
  siteKey: string;
  demo: boolean;
  cafe: boolean;
  tableToken: string | null;
  currency: string;
  products: ProductView[];
  strings: ThemeStrings;
  settings?: {
    showFavorites?: boolean;
    showCategoryTabs?: boolean;
    showSearch?: boolean;
  };
}

export type ModifierSelection = Record<string, string[]>;

declare global {
  interface Window {
    eshobeRenderModifiers?: (
      container: HTMLElement,
      product: ProductView,
      selection: ModifierSelection,
      onChange: (nextSelection: ModifierSelection) => void,
      strings: ThemeStrings,
      locale: string,
    ) => void;
    eshobeUnmountModifiers?: (container: HTMLElement) => void;
    eshobeRefreshToolbar?: () => void;
  }
}

/// <reference path="../.astro/types.d.ts" />

declare global {
  interface Window {
    Modal: {
      show: (id: string, message: string, title?: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
      hide: (id: string) => void;
    };
  }
}

export {};
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'EN' | 'BN';

interface LanguageState {
  lang: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      lang: 'EN',
      setLanguage: (lang: Language) => set({ lang }),
      toggleLanguage: () => set({ lang: get().lang === 'EN' ? 'BN' : 'EN' }),
    }),
    {
      name: 'ticket-dorkar-language',
    }
  )
);

'use client';

import { useEffect, useState } from 'react';
import { useLanguageStore } from '@/lib/store/languageStore';

interface LanguageToggleProps {
  className?: string;
  variant?: 'light' | 'dark' | 'transparent';
}

export function LanguageToggle({ className = '', variant = 'light' }: LanguageToggleProps) {
  const { lang, toggleLanguage } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-8 w-20 bg-gray-100 rounded-full animate-pulse ${className}`} />
    );
  }

  const isDark = variant === 'dark';
  const isTransparent = variant === 'transparent';

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      title={lang === 'EN' ? 'Switch to Bangla (বাংলা)' : 'Switch to English'}
      className={`inline-flex items-center gap-1 p-1 rounded-full border text-xs font-bold transition-all active:scale-95 shadow-2xs ${
        isDark
          ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
          : isTransparent
          ? 'bg-white/15 border-white/30 text-white hover:bg-white/25'
          : 'bg-gray-100 border-gray-200 text-gray-800 hover:bg-gray-200/80'
      } ${className}`}
    >
      <span
        className={`px-2 py-0.5 rounded-full transition-all text-[11px] ${
          lang === 'EN'
            ? 'bg-[#E31B23] text-white font-black shadow-xs'
            : isDark || isTransparent
            ? 'text-gray-300'
            : 'text-gray-600'
        }`}
      >
        EN
      </span>
      <span
        className={`px-2 py-0.5 rounded-full transition-all text-[11px] ${
          lang === 'BN'
            ? 'bg-emerald-600 text-white font-black shadow-xs'
            : isDark || isTransparent
            ? 'text-gray-300'
            : 'text-gray-600'
        }`}
      >
        বাংলা
      </span>
    </button>
  );
}

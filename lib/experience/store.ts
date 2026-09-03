'use client';

import { create } from 'zustand';
import type { ExperienceQuality } from '@/types/experience';

type ExperienceState = {
  activeChapter: string;
  quality: ExperienceQuality;
  soundEnabled: boolean;
  setActiveChapter: (chapter: string) => void;
  setQuality: (quality: ExperienceQuality) => void;
  setSoundEnabled: (enabled: boolean) => void;
};

export const useExperienceStore = create<ExperienceState>((set) => ({
  activeChapter: 'intro',
  quality: 'full',
  soundEnabled: false,
  setActiveChapter: (activeChapter) => set({ activeChapter }),
  setQuality: (quality) => set({ quality }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
}));

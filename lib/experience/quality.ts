import type { ExperienceQuality } from '@/types/experience';

export function getInitialExperienceQuality(): ExperienceQuality {
  if (typeof window === 'undefined') return 'reduced';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'accessible';
  if (window.matchMedia('(max-width: 767px)').matches) return 'reduced';
  return 'full';
}

'use client';

import { useEffect } from 'react';
import { detectGraphicsTier, detectWebglSupport } from './graphics-tier';
import {
  prefersReducedMotion,
  subscribeReducedMotion,
} from './motion-preferences';
import { subscribeScrollMetrics } from './scroll-metrics';
import { useExperienceStore } from './store';
import { isDocumentVisible, subscribeVisibility } from './visibility';

/**
 * Arranca el runtime de la experiencia. Debe usarse una sola vez, en
 * `ExperienceShell`: es el único lugar donde se conectan las fuentes de
 * entorno (movimiento reducido, visibilidad, tier gráfico) y el driver de
 * scroll con el store.
 *
 * Todas las suscripciones son simétricas, así que un remontaje (React Strict
 * Mode incluido) no deja listeners duplicados.
 */
export function useExperienceRuntime() {
  useEffect(() => {
    const { setReducedMotion } = useExperienceStore.getState();
    setReducedMotion(prefersReducedMotion());
    return subscribeReducedMotion(setReducedMotion);
  }, []);

  useEffect(() => {
    const { setDocumentVisible } = useExperienceStore.getState();
    setDocumentVisible(isDocumentVisible());
    return subscribeVisibility(setDocumentVisible);
  }, []);

  useEffect(() => {
    const { setScrollMetrics } = useExperienceStore.getState();
    return subscribeScrollMetrics(setScrollMetrics);
  }, []);

  useEffect(() => {
    const { setGraphicsTier, setWebglAvailable } =
      useExperienceStore.getState();
    setWebglAvailable(detectWebglSupport());
    setGraphicsTier(detectGraphicsTier());
  }, []);
}

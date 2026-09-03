'use client';

import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';

/**
 * Punto de entrada para las escenas 3D. No se monta todavía en la portada:
 * se cargará de forma diferida cuando exista un modelo web aprobado.
 */
export function SceneViewport({ children }: { children?: React.ReactNode }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 4], fov: 35 }}
    >
      <PerformanceMonitor>
        <AdaptiveDpr pixelated />
        {children}
      </PerformanceMonitor>
    </Canvas>
  );
}

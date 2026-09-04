'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { media } from '@/content/media';
import {
  getInfectionFrame,
  subscribeInfectionFrame,
} from '@/lib/experience/infection-frame';
import { sampleInfection } from '@/lib/experience/infection-timeline';
import { useExperienceStore } from '@/lib/experience/store';
import { createInfectionMaterial } from './infection-material';

const images = [
  media.images.growth,
  media.images.blubberRoom,
  media.images.vessel,
] as const;

/** Start loading at Draga, not at the hero. Keep the resources for reverse scroll. */
export function InfectionScene() {
  const [requested, setRequested] = useState(false);
  useEffect(() => {
    if (requested) return;
    const check = () => {
      const { chapter } = useExperienceStore.getState();
      if (
        chapter === 'draga' ||
        chapter === 'infection' ||
        getInfectionFrame().visible
      )
        setRequested(true);
    };
    check();
    const stopFrame = subscribeInfectionFrame(check);
    const stopChapter = useExperienceStore.subscribe((state, previous) => {
      if (state.chapter !== previous.chapter) check();
    });
    return () => {
      stopFrame();
      stopChapter();
    };
  }, [requested]);
  return requested ? <InfectionPlane /> : null;
}

function InfectionPlane() {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial | null>(null);
  const loaded = useRef(false);
  const announced = useRef(false);
  const mounted = useRef(false);
  const loadGeneration = useRef(0);
  const graphicsTier = useExperienceStore((state) => state.graphicsTier);
  const viewport = useThree((state) => state.viewport);
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);

  // Create/dispose with the effect, including Strict Mode's setup/cleanup replay.
  useEffect(() => {
    const instance = createInfectionMaterial();
    material.current = instance;
    if (mesh.current) mesh.current.material = instance;
    mounted.current = true;
    return () => {
      mounted.current = false;
      instance.dispose();
      if (material.current === instance) material.current = null;
      useExperienceStore.getState().setInfectionSceneReady(false);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const currentMesh = mesh.current;
    const generation = ++loadGeneration.current;
    loaded.current = false;
    announced.current = false;
    useExperienceStore.getState().setInfectionSceneReady(false);
    const loader = new THREE.TextureLoader();
    const textures = new Set<THREE.Texture>();
    const load = (url: string) =>
      new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(
          url,
          (texture) => {
            if (cancelled) {
              texture.dispose();
              resolve(texture);
              return;
            }
            textures.add(texture);
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
            resolve(texture);
          },
          undefined,
          reject,
        );
      });
    void Promise.allSettled(
      images.map((image) =>
        load(graphicsTier === 'a' ? image.webp.large : image.webp.small),
      ),
    ).then((results) => {
      const instance = material.current;
      if (cancelled || !instance || generation !== loadGeneration.current)
        return;
      if (results.some((result) => result.status === 'rejected')) {
        for (const texture of textures) texture.dispose();
        textures.clear();
        return;
      }
      const [a, b, c] = results.map(
        (result) => (result as PromiseFulfilledResult<THREE.Texture>).value,
      );
      instance.uniforms.uGrowth.value = a;
      instance.uniforms.uRoom.value = b;
      instance.uniforms.uVessel.value = c;
      loaded.current = true;
      if (getInfectionFrame().visible) invalidate();
    });
    return () => {
      cancelled = true;
      loaded.current = false;
      announced.current = false;
      useExperienceStore.getState().setInfectionSceneReady(false);
      if (currentMesh) currentMesh.visible = false;
      for (const texture of textures) texture.dispose();
      textures.clear();
    };
  }, [graphicsTier, invalidate]);

  useEffect(
    () =>
      subscribeInfectionFrame(() => {
        // One invalidation on exit clears the old frame; no self-sustaining loop.
        if (getInfectionFrame().visible || mesh.current?.visible) invalidate();
      }),
    [invalidate],
  );

  const handleRendered = useCallback(() => {
    if (!loaded.current || announced.current) return;
    announced.current = true;
    const generation = loadGeneration.current;
    queueMicrotask(() => {
      if (
        mounted.current &&
        loaded.current &&
        generation === loadGeneration.current
      )
        useExperienceStore.getState().setInfectionSceneReady(true);
    });
  }, []);

  useFrame(() => {
    const node = mesh.current;
    const instance = material.current;
    if (!node || !instance) return;
    const frame = getInfectionFrame();
    const state = useExperienceStore.getState();
    node.visible = loaded.current && frame.visible && state.documentVisible;
    if (!node.visible) return;
    const montage = sampleInfection(frame.progress);
    const uniforms = instance.uniforms;
    uniforms.uBounds.value.set(
      frame.left,
      frame.top,
      frame.width,
      frame.height,
    );
    uniforms.uResolution.value.set(size.width, size.height);
    uniforms.uPointer.value.set(
      frame.pointerX,
      frame.pointerY,
      frame.pointerActive,
    );
    uniforms.uRoomMix.value = montage.room;
    uniforms.uVesselMix.value = montage.presence;
    uniforms.uTension.value = montage.tension;
    uniforms.uRed.value = montage.red;
    uniforms.uDetail.value = state.graphicsTier === 'a' ? 4 : 2;
  });

  return (
    <mesh
      ref={mesh}
      visible={false}
      renderOrder={2}
      scale={[viewport.width, viewport.height, 1]}
      onAfterRender={handleRendered}
    >
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

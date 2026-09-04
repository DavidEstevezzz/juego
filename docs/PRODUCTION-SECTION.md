# Production / Deck 06

Local implementation of Prompt 07. This is a natural-flow editorial chapter after Infection, not another pinned scroll sequence. Existing gameplay, character, infection and typography decisions are preserved.

## Art direction and content

- Heading: “Before the dark takes shape.” A quiet editorial opening with readable copy beside it.
- One large scene comparison, then Space / Surface / Light notes, a manual three-frame gallery and a studio/teaser footer.
- All new copy is English. The chapter labels the editorial copy as draft. Production stage and platforms are explicitly pending studio approval; no fabricated milestones, funding figures, team size or partners.
- The teaser reuses the existing accessible dialog and is only requested on explicit interaction. It is not described as a full trailer. Captions remain unavailable until the studio supplies them.
- The external studio link is the studio URL already supplied by the user. No invented email address or enquiry form.

## Comparison behavior

- Underlying image: an explicitly identified AI-recreated blockout.
- Revealed image: the existing original storage-compartment game capture.
- Mouse/pen exploration uses a soft cached radial brush, 140 ms entrance, hold until 2.2 s of age and 1.7 s smooth decay. Total lifetime 3.9 s. The gesture is gently followed without moving the text or the image.
- Pointer data stays outside React. No global scroll listener, shader, extra WebGL context or new animation dependency.
- A local Canvas2D composites the original image through a small mask. Resolution caps: 1600 px (A), 1100 px (B), mask at most 640 px; DPR capped at 1.25 before the backing-size cap.
- Spatial sampling avoids adding a stamp every display frame. A 384-stamp ceiling bounds memory and work; an exceptionally long/fast scribble can evict older marks before their normal expiry. Normal input expires by absolute elapsed time, not frame count.
- RAF exists only while pointer easing or a fading trail requires it. Visibility loss, leaving the viewport, reduced motion, mode changes and unmount clear the trail and release work. No idle loop.
- Full-view buttons work for keyboard and touch. Touch gestures are not captured; vertical scrolling and pinch zoom remain native. Tier C and reduced motion use static comparison modes.
- Decoding completes before the reveal starts. Cached pre-hydration image loads are detected. A failed image selects the remaining view; 2D/decode failure only removes exploration. Without JavaScript an ordinary link opens the original capture.
- Gallery uses the existing Embla/shadcn primitives with manual buttons, keyboard and swipe, no autoplay. Its reduced-motion duration is zero. The shared primitive now unsubscribes its reInit listener too.

## Asset provenance

Mode: built-in ImageGen **edit** using `referenced_image_paths`, one request, no retry. The prompt was delegated to an image-only agent; integration and optimization were performed by the site owner.

Reference: `public/assets/media/images/submarine-storage-1920.webp` (1920 × 996).

Generated master: `source-assets/images/production-storage-blockout-v1.png` (1649 × 954), retained locally under the repository’s existing ignored-source convention. The original generated output also remains at `C:/Users/david/.codex/generated_images/01a06c04-842b-7a03-bbaf-047d5caee815/exec-3becf9c8-aa6a-4236-94e7-435039a16838.png`.

Saved web assets:

- `public/assets/production/storage-blockout-v1-1920.avif` — 1920 × 996, 84,949 bytes.
- `public/assets/production/storage-blockout-v1-1920.webp` — 1920 × 996, 124,132 bytes.
- `public/assets/production/storage-blockout-v1-960.avif` — 960 × 498, 25,986 bytes.
- `public/assets/production/storage-blockout-v1-960.webp` — 960 × 498, 42,044 bytes.

The generation did not retain the requested aspect ratio or exact geometry. It was normalized by fill to the final image’s frame, without a second cover crop. It is **not pixel-registered, not a real early-development capture, and not evidence of an Unreal Engine workflow**. The UI and image alternative text disclose this. Do not remove that disclosure before replacing the recreation with authentic material.

Both the generated source and its optimized version were inspected as local images. No UI screenshots were taken.

### Final generation prompt

```text
Use case: style-transfer.
Asset type: Provisional AI-recreated early-production image for a website pointer-reveal comparison against the supplied final game screenshot.
Input images: Image 1 is the EDIT TARGET, not merely inspiration. Transform this exact image in place.
Primary request: Change only the rendering treatment of the exact nautical storage-room screenshot into a restrained dark gray clay/blockout viewport with readable fine desaturated steel-green polygon wireframe edges. Preserve camera, perspective, apparent focal length, all major silhouettes, occlusions, object positions and architectural edges as closely as possible; image registration against the original is the highest priority. Do not invent a similar room.
Composition/framing: Full-bleed 1920:996 landscape, same canvas aspect ratio, exactly the same crop, horizon, vanishing points and viewpoint as Image 1. No camera shift, no zoom, no widening of the room. Keep the large vertical shelf structure at both edges, the tabletop spanning lower-left toward center, the coarse draped form and hanging net silhouette at foreground left, the round ceiling lamp near the upper center-right, the hanging lifebuoy ring at the upper-right shelving, right-side barrels and small steps, central rear storage/opening, supports, floor boundaries and every major object in its original place and scale.
Style/medium: Believable early 3D production clay/blockout viewport. Simple matte untextured solid geometry with soft neutral ambient occlusion. Fine subdued steel-green wireframe polygon edges must trace actual apparent surfaces and perspective, following their geometry, not an arbitrary line overlay. Keep the clay solids visible underneath. Simplify only tiny net strands and minor clutter into coarse mesh geometry, preserving their overall volume and silhouette. Retain the ring-shaped lifebuoy, circular ceiling lamp, shelves, supports, tabletop, doorway and barrel forms.
Lighting/mood: Neutral ambient scene visibility and soft contact shadows, atmospheric charcoal, restrained and readable. Remove warm final lighting, orange illumination, cinematic bloom, material reflections, wood grain, grime, detailed cloth/net textures. Enough tonal separation to recognize the architecture, still substantially darker than a white editor viewport.
Color palette: Charcoal and muted medium gray, faint desaturated steel-teal/steel-green edges; no saturated colors.
Constraints: Change rendering/material/light treatment only; preserve all major geometry and image-space placement. No extra elements. No people, no text, no labels, no fake engine editor UI, no logos, no watermark, no axis gizmos, no decorative neon, no holograms. Output only the edited image.
```

## Replacing the provisional pair

Ask the studio for a blockout/lighting/material view and final view exported from **exactly the same camera transform, lens/FOV, aspect ratio, crop and resolution**, without editor chrome. Avoid HUD/UI if possible. The original final image here includes only the scene.

1. Add a new versioned pair of approved 960/1920 AVIF and WebP images.
2. Update `media.images.productionBlockout` and `media.images.storage` in `content/media.ts`. If the aspect ratio changes, update the 1920/996 image dimensions and `.production-scene` aspect ratio together.
3. Replace the disclaimer, image alt text and provenance in `content/chapters.ts` with accurate studio-approved descriptions. Update the caption, draft copy and pending facts only when approved.
4. No reveal code changes are necessary for a registered pair with the same dimensions.

`node scripts/optimize-production-assets.mjs` regenerates only these four files from the local ignored master. It does not delete other assets. On a fresh clone the web-ready images work immediately; regeneration requires supplying the master. The general media optimizer deletes/rebuilds its own output, so production assets deliberately live outside that output folder.

## Verification

- `npm run lint` and `npx tsc --noEmit`.
- `node --experimental-strip-types --test tests/production-runtime.test.mjs tests/infection-runtime.test.mjs` — 9 tests, including spatial sampling at 30/60/144/240 Hz, bounded buffers, age-based fade, mocked idle RAF, hidden/offscreen pause, reduced motion, cleanup/remount and unavailable Canvas2D.
- `npm run build` — all five Vinext environments. Existing warnings about large chunks and route classification remain; no claim of measured runtime FPS is made.
- Local server HEAD request returned 200; preview opened at `http://localhost:3000/#production`.

The runtime tests use test doubles, not browser measurements. Browser visual/responsive/accessibility/performance testing has not been performed in this pass. Verify the finished composition and the actual pointing feel on the target devices before public release.

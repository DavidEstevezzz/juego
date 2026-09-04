# Final signal / Deck 07

The closing section is implemented at `#signal`. It resolves the sequence with the existing opening poster, a short draft line (“The deep is calling.”), one principal Steam CTA and a quieter studio footer. The poster is reused from cache; there is no new image, video request, canvas or dependency.

## Direction and behavior

- Natural document flow: no sticky stage, pinning, scrub or pointer effect.
- One 1.8-second lighting/scale entrance for decorative artwork only. Text and actions remain visible and stationary from the server render.
- GSAP uses the existing registry and a scoped context. A local IntersectionObserver starts the entrance; the shared visibility source pauses it when the tab is hidden. Leaving the section completes it immediately. Completion releases observer/subscription work; unmount restores styles. It never loops or replays during the same mount.
- Reduced motion and tier C show the full static composition. The CSS baseline is also complete without JavaScript.
- On mobile, the silhouette occupies the upper part of the composition; copy and the full-width CTA follow in normal flow.
- Footer includes studio credit/link, native return-to-top and all seven chapter names. No intercepted anchors or history rewriting.
- The Accessibility dialog explains the actual OS/browser motion preference, keyboard behavior and teaser audio. Its initial focus is the title so short viewports do not open scrolled to the bottom. The existing dialog primitive owns focus containment, Escape and return to the trigger.

## Boundaries

The request was for the final section, not a navigation/runtime redesign. The existing top chapter bar is unchanged. A new global menu and manual site-wide motion override remain outside this change. In particular, no misleading toggle was added that would disable only some animations while leaving CSS-driven chapters moving.

Steam and studio destinations reuse supplied URLs. No social handles, email addresses, dates, awards, partners or legal claims are invented. The privacy policy is explicitly pending studio approval, not a dead link. The short closing headline is draft editorial copy pending approval.

## Verification

Lint, TypeScript, formatting and the production build are checked. The nine existing Production/Infection runtime tests are regression coverage; they do not constitute browser testing of this section. A local HTTP HEAD request returned 200. The preview handoff targets the existing browser tab rather than adding another.

No browser screenshots, DOM inspection or interaction/viewport tests were performed in this pass. Visual composition, touch behavior, keyboard/focus and contrast over the image still need a browser QA pass before release. The build retains its existing large-chunk/static-route-classification warnings.

# Draga — hold-to-reveal prototype

The two supplied screenshots and PDF pages 4 and 12 were inspected before creating the expanded portraits with built-in ImageGen. Both generated portraits are aligned to the same head position, costume and ship interior. They are illustrative AI expansions, not new in-game footage.

Assets: `public/assets/media/images/draga-human-expanded-*` and `draga-infected-expanded-*` (AVIF/WebP, 960 and 1600 widths).

Generation brief: expand both originals to a matching portrait frame with upper thighs and lateral space; preserve Draga's face, worn sailor's clothing, lamp, belts and the distinctive broad fleshy tentacles of the supplied infected image; use the generated human frame as an alignment reference for the infected version. The original asset worker's exact final tool prompts were not retained when its turn hit the usage limit.

Interaction: hold for 2.4 seconds to reveal the infected portrait from the arm using an irregular expanding contour. Early release retreats; completion remains until reset. No scroll-controlled progress, no anatomical morph, no continuous idle animation. Reduced motion uses an immediate reveal. Pointer capture, keyboard input, background cancellation and image readiness are handled locally.

Validation: lint/type checks; frame-loop and timing tests; browser inspection of loaded images, layout and short keyboard activation. A full physical long-press was not automated by the available browser API.

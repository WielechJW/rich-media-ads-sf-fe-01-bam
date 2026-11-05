# Decision log

## Variant B — Fireplace

- **Independent documents:** top, left and right each have their own HTML and share
  one stylesheet and one JavaScript module. The preview embeds them in iframes.
  There is no framework or runtime dependency.
- **Native animations:** the Web Animations API provides the required easing,
  scheduling, pause/resume and finite loops. GSAP was considered in the plan, but
  a dependency adds little for this short, fixed sequence.
- **Background:** use only the supplied master image at 1680×975 CSS px. The stage
  is 1672×975. Crop 4 CSS px from each outer edge rather than stretch the artwork.
  Image offsets are −4, −324 and −1356 CSS px for left, top and right. All parts
  therefore sample consecutive windows of one image and retain the 2x density.
- **Seams during motion:** animate the full background with the same transform
  origin (840, 487.5) in image coordinates and the same start timestamp in each
  document. Scaling around individual slot centres would break continuity.
- **Reference differences:** the master has differences in product size and
  positioning compared with the supplied precut backgrounds. The top headline artwork has
  different wording from the design reference. Preserve supplied artwork and
  report these differences; request corrected exports for exact sign-off.
- **Product motion:** the JPG already contains products, flowers and packaging.
  Reveal and subtly zoom the composition; do not redraw products or fabricate a
  clean background for independent product movement.
- **Broken transparency:** the indexed panel, side copy and CTA exports contain
  opaque black backgrounds. Remove exact black from the panel/CTA and recover
  white-text coverage from grayscale intensity in the side headlines. Crop to
  the visible bounds and place the result at the original coordinates divided
  by two. The translucent panel uses opacity 0.83 to approximate the reference.
- **Intro and loops:** the intro completes in 4.4 seconds. CTA pulses run for
  eight 3.2-second cycles starting at 4.4 seconds, stopping at exactly 30 seconds.
  Reduced motion bypasses the timeline and displays the final layout.
- **Synchronisation:** children decode images, then report ready. The preview sends
  a common epoch 120 ms in the future. Messages validate origin and source. Each
  child maps that epoch to its own document timeline. Replay cancels old animations
  before creating new ones; standalone documents start without a parent.
- **Visibility:** hidden documents pause their existing animations and resume them
  when visible. No background animation interval runs indefinitely.
- **Clickout:** each whole creative is an accessible anchor with a new-window target
  and `noopener`. The host click tag is read on setup and again on activation.
  The preview passes its tag to the children. Only HTTP(S) landing URLs are used.
- **Compression:** re-encode the 1,995,071-byte master JPEG at quality 65 with
  progressive encoding and optimisation, keeping 3360×1950 pixels. The result is
  1,392,989 bytes (about 30% smaller). All prepared images total 1,609,077 bytes.
  Exact runtime and ZIP sizes are printed by the packaging script. PNG layer
  processing is reproducible with `scripts/prepare_fireplace.py`.
- **Packaging:** keep reference/source files available during development; export
  only used files to `dist/fireplace`. The current working repository still has
  the original materials and exceeds 3 MB. The final submission repository must
  contain the selected delivery files for both variants within the agreed budget.

## Variant A — Game

Implementation pending. The proposed approach and acceptance criteria are in
`PLAN.md`.

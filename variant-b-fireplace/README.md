# Fireplace Ad

Three independent creatives: `top.html` (1032×250), `left.html` and `right.html`
(320×975 each). `preview.html` aligns the parts around an empty publisher area.

From this directory, or the root of the source repository, run:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080/preview.html` when serving this directory, or
`http://localhost:8080/variant-b-fireplace/preview.html` when serving the root.
The preview fits the available width; “Rozmiar 1:1” shows actual CSS sizes.
“Odtwórz intro” replays the coordinated intro.

## Behaviour

- All three HTML files also work independently. Each complete part is a native
  outbound link using `window.clickTag || 'https://example.com/landing'`.
- In the preview, assign `window.clickTag` on the preview window before the
  creatives report ready (or before replay) to pass the same tag to all parts.
- One shared background image keeps the moss continuous. The intro uses a common
  start time and a common background transform origin across the three documents.
- A 4.4-second intro is followed by eight subtle CTA pulses, ending at 30 seconds.
- Reduced motion shows the final composition immediately. Changing the preference
  also updates the open creatives. Hiding the document pauses its animations.
- `?still=1` shows a still composition for visual review, including in the preview.
- No runtime libraries, build step, external requests, or CDN are required.

## Source materials and known differences

The supplied top headline reads “STARK BEI / HUSTENREIZ & / HALSSCHMERZEN.”,
whereas the layout reference has different wording. The supplied artwork is kept.
Products are baked into the JPG; the intro animates the complete background rather
than inventing separate product layers. The wider master background is cropped
symmetrically by 4 CSS px per edge. The master also has differences in product size
and positioning compared with the separate supplied crops, so this version
prioritises continuous moss. See `DECISIONS.md` for the exact coordinates.

The black backgrounds in the indexed PNG exports have been repaired mechanically;
the campaign artwork has not been redrawn. Cropped layers retain their 2x density.

With more time and the appropriate exports, the next steps would be matching the
headline wording, animating separate product layers, and obtaining a final design
review of the master-background crop against the layout reference.

## Packaging and asset preparation

In the source repository, `python3 scripts/package_fireplace.py` writes
`dist/fireplace/` and `dist/fireplace.zip`. It checks the uncompressed package size
against 3,000,000 bytes. The original assets and reference designs are retained as
working materials in the source repository and are excluded from this export.
The complete working repository is therefore larger than the ad package; it is
not yet the final submission repository for both variants.

Prepared images are included and ready to use. To reproduce them, install Pillow
in your development Python environment and run `python3 scripts/prepare_fireplace.py`
from the source repository root. This is not required to view or package the ad.

## AI note

Codex assisted with asset inspection, HTML/CSS/JavaScript implementation and browser
checks. An initial assumption that all supplied PNG layers had transparent
backgrounds was disproved by checking their palette and alpha values; the affected
layers were repaired during asset preparation. Browser checks and visual review
were used to assess the implementation, and the source-asset limitations are
documented instead of generating replacement campaign graphics.

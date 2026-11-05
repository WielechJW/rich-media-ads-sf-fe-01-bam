# Fireplace

Serve the repository with `python3 -m http.server 8080`, then open `/variant-b-fireplace/preview.html`. The individual `top.html`, `left.html` and `right.html` also work independently through the server. All runtime assets are local.

Top is 1032×250 CSS px; sides are 320×975. The preview fits available width or shows 1:1 size and can replay the intro. Three decoded documents receive one common start time. The 4.4-second intro ends with CTA entrance; finite pulses stop at 30 seconds. Reduced motion displays the final state. Hiding/showing the tab does not restart finished effects.

Every whole part opens `window.clickTag || 'https://example.com/landing'` in a new window. Assign a tag to the preview before start/replay to pass it to children, or to a standalone creative directly. `?still=1` shows a still composition.

Known source inconsistency: supplied top headline wording differs from the reference; the continuous master has different product positions/sizes than precut sides. This version preserves supplied artwork and the continuous background. Exact visual sign-off needs corrected or confirmed exports. Products are baked into JPGs; independent product slide-in is not fabricated. Indexed PNG transparency is mechanically restored.

See the root README, DECISIONS.md and VALIDATION.md for full decisions, known limitations, size and tests.

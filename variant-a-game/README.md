# Gut Run

Serve the repository with `python3 -m http.server 8080`, then open `/variant-a-game/`.

Tap/click or press Space/Arrow Up to jump. The first tap starts the run and unlocks audio. The top-right speaker toggles mute; the fail endcard includes replay. Every CTA uses the host `window.clickTag` with the brief's fallback.

The game uses supplied 2x assets, a fixed 360×640 world uniformly fitted into the dynamic visible viewport, 15 unique scheduled obstacles, alpha-mask collision, a small player margin, complete fail/win endcards and five supplied audio tracks. Visibility/viewport intersection pause both gameplay and sound. Decorative animation respects reduced motion.

`?debug=1` displays the actual collision masks and exposes a read-only snapshot for QA. No gameplay bypass is included.

See the root README, DECISIONS.md and VALIDATION.md for decisions, reproduction, compression and test results.

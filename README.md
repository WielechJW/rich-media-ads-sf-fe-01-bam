# Rich media ads — SF-FE-01-BAM

Two standalone, dependency-free HTML/CSS/JavaScript creatives built with the supplied campaign artwork.

## Run

```sh
python3 -m http.server 8080
```

Open **http://localhost:8080/** to choose a preview:

- **A — Gut Run:** `/variant-a-game/`, a portrait tap-to-jump game. Tap/click or press Space/Arrow Up. The first tap starts the run and unlocks sound. Use the speaker button to mute. The fail screen includes replay.
- **B — Fireplace:** `/variant-b-fireplace/preview.html`. The preview fits the available width; “Rozmiar 1:1” shows actual size and “Odtwórz intro” replays the coordinated intro. `top.html`, `left.html` and `right.html` also work independently.

No npm install, bundler, CDN or runtime library is required to view either ad.

## Features

A has a deterministic route containing all 6 bacteria and 9 text obstacles once, a gently increasing scroll speed, alpha-based collision with a small player margin, complete fail/win screens, five audio tracks, clean replay, visibility pause and reduced decorative motion. The fixed 360×640 scene scales uniformly inside the dynamic viewport with safe-area padding. Background colour fills any remaining space.

B has a shared continuous 2x background, a 4.4-second intro, three-line headline reveal, coordinated iframe start and eight gentle CTA pulses ending at 30 seconds. Reduced motion shows the final state. Completed animations remain finished after hiding and showing the tab.

All CTA links open `window.clickTag || 'https://example.com/landing'` in a new window. Set `window.clickTag` in each standalone creative. The B preview passes its own click tag to children on start/replay.

## Known material limitations and shortcuts

- B's supplied top PNG says “STARK BEI / HUSTENREIZ & / HALSSCHMERZEN.”, while `design/layout.png` in the original task says “NATÜRLICH STARK …”. The supplied master background also differs in product positioning/size from the precut side images. This implementation preserves the supplied exports and continuous background. **Exact visual sign-off against that reference needs corrected/confirmed exports; documenting the mismatch is not an approval of it.**
- Products are baked into the JPG. The complete background is revealed/zoomed rather than generating replacement product or background layers. Product slide-in is an example in the brief, not a separately required interaction.
- Indexed PNGs in B lacked transparency. Their black mattes were mechanically removed and white-text antialiasing recovered. No campaign artwork was redrawn.
- Actual phone hardware and Safari on macOS/iOS still need a final device check; viewport emulation is not a physical-device test.

With more time: obtain consistent B exports, finish exact visual sign-off, test on physical iOS/Android devices and tune level difficulty with several first-time players. Optional additions would be a design overlay and a short recording; no recording is included.

## Size and packaging

```sh
python3 scripts/package_submission.py
```

This creates `dist/submission/` and `dist/submission.zip`. The script enforces **less than 3,000,000 bytes for both ads together**, including the delivered source, tests, lockfile and docs. The limit is measured before ZIP compression. `.git`, installed development dependencies, generated screenshots and previous exports are excluded.

Prepared images/audio are included. Original unused assets and design references are intentionally excluded from this new repository. Image dimensions retain the original 2x density. MP3s are mono 56 kbps; music keeps its complete loop, and one-shot effects have shorter tails and a 350 ms fade-out. The B master JPG is progressively re-encoded at quality 65. See [DECISIONS.md](DECISIONS.md).

## Verification

Viewing requires only the server above. Optional development checks:

```sh
npm ci
npx playwright install chromium
npm run test:unit
npm run test:browser
```

Keep the local server running on port 8080 for browser tests. `TEST_URL` overrides its address. `BROWSER_CHANNEL=chrome` uses an installed Google Chrome instead of bundled Chromium. See [VALIDATION.md](VALIDATION.md) for checks and limits.

A's `?debug=1` shows the actual alpha hit masks and exposes a read-only snapshot (`window.gutRunDebug.snapshot()`) for inspection. There is no skip-to-win/debug invincibility path. B's `?still=1` displays the final composition for visual review.

## AI note

Codex assisted with asset inspection, implementation, compression and automated browser checks. One incorrect implementation resumed every Web Animation after visibility changes: playing an already finished effect rewound the intro and restarted the CTA loop. This was corrected by remembering only animations that were actually running, with a browser regression test covering the completed 30-second cycle. Mobile review also caught CSS Grid sizing the unscaled scene wider than a 320 px viewport; explicit zero-minimum grid tracks fixed the crop. Every implementation decision and remaining material limitation is recorded in the repository.

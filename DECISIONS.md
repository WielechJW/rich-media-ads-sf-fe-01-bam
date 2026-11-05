# Decision log

## A — Gut Run

- Canvas 2D renders moving artwork; native DOM buttons and layered supplied PNGs render the tutorial/endcards. Plain ES modules keep simulation, collisions and audio separate. No runtime framework or game engine is needed for 15 obstacles.
- The world is 360×640 CSS units. Images render at half their source dimensions. A uniformly transformed scene fits `100dvh` (with `100vh` fallback), safe areas and changing visual viewport height. Canvas backing resolution uses DPR capped at 2. Explicit `minmax(0, 1fr)` grid tracks prevent a 360 px intrinsic scene overflowing a 320 px phone.
- Physics uses a single RAF loop, a 1/120-second fixed step and a 50 ms frame-delta cap. Pause clears the time accumulator before resume. Scroll speed increases from 72 to 84 world units/second. First interaction gives a gentle initial impulse because the measured tutorial player position is close to the upper border.
- One ordered level uses exactly `bac1`–`bac6` and `txt1`–`txt9`. The first obstacle begins at x=400, with 140-unit spacing. The 2528-unit track ends after every obstacle has passed; the verified route takes about 31.3 seconds and 32 jumps.
- An AABB broad phase precedes actual alpha-mask overlap. Masks are decoded once, not read from the canvas every frame. A one-pixel erosion of the player mask makes near misses forgiving. The visible border alpha is also the boundary collision geometry, avoiding an invisible rectangular death line. Level placement uses conservative top/bottom margins. Debug shows these same masks.
- Audio uses one Web Audio context, decoded supplied MP3 buffers, one master gain/mute and a tracked set of sources. Nothing plays before user interaction. Music loops during gameplay. Crash/fail play on loss; applause and cheer on win. Replay stops and removes old sources. Suspending the context preserves sound position while hidden/offscreen.
- Replay returns to the initial tutorial and clean physics state; the next tap starts a new run. Event listeners are installed once. Visibility and IntersectionObserver reasons share one pause gate, so one observer cannot resume a still-hidden ad. Reduced motion removes decorative effects, not gameplay physics.
- Compress source PNGs losslessly without changing their dimensions. MP3s go from 1,369,577 to 480,280 bytes: mono, 32 kHz, 56 kbps. Keep the full music loop; cap crash/fail/cheer/applause at 2/3/2.5/4 seconds with 350 ms fade-outs. All prepared A assets total 1,150,597 bytes.

## B — Fireplace

- Three independent HTML documents share CSS and one native Web Animations module. The preview embeds them around an empty publisher area. Native animation provides the required easing/timing without adding GSAP as a runtime dependency.
- The supplied 3360×1950 master renders at 1680×975. The stage width is 1672, so centre-crop 4 CSS px from each outer edge. Image offsets are −4, −324 and −1356 for left/top/right. Every slot is a consecutive window of one image at original 2x density.
- All background animations use the same image-space transform origin (840, 487.5) and the same start epoch; separate slot-centre zooms would break the seams. Children decode assets before reporting ready. Preview validates message origin/source and sends a shared start time 120 ms ahead. Standalone creatives start without a parent.
- The intro finishes at 4.4 seconds, with CTA entrance after copy. Eight 3.2-second pulses end at 30 seconds. Reduced motion shows the final DOM composition. Pause/resume remembers only running animations: `play()` on a finished animation would rewind it. Replay cancels the previous effects.
- Every entire part is an accessible new-window anchor with `noopener`. Standalone tags are read on setup and activation. Preview passes its tag to children on start/replay. Only HTTP(S) landing URLs are used in B.
- Supplied indexed panel, side-copy and CTA PNGs have opaque black mattes. Remove exact black from solid artwork; recover white-text coverage from intensity. Crop to visible bounds and place at the source coordinates divided by two. Panel opacity 0.83 approximates the reference.
- Re-encode the 1,995,071-byte master JPG to 1,392,989 bytes with progressive JPEG quality 65, keeping original dimensions. All prepared B images total 1,609,077 bytes.

## Material inconsistency requiring confirmation

The top headline supplied as an asset has different wording/typographic layout from the reference. The continuous master image also positions/scales products differently from the precut side backgrounds. Use the supplied exports and report the discrepancy; do not invent replacement campaign artwork. Products are already baked into JPGs, so animate the composition instead of fabricating separated layers. The exact pixel-accuracy requirement cannot be signed off against inconsistent inputs without corrected exports or recruiter confirmation. This remains a known material limitation, not a silently waived requirement.

## Delivery

A new repository with a fresh history contains only needed runtime assets, source, docs and tests. It is not a fork and does not import the starter history. All delivered files for both variants together must remain below 3,000,000 bytes before ZIP compression. The packaging script checks the total; Git internals, optional installed test tools and generated QA output are not delivery assets. No optional video is included.

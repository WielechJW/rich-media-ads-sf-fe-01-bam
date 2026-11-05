# Validation

## Automated checks

- Four Node tests: required 15 unique obstacle IDs; a complete winning input trace;
  collision/reset; boundary failure and terminal-state stability; transparent alpha
  pixels versus actual mask overlap. The recorded route is verified with stricter
  rectangular collision as well as through the browser's real image masks.
- Game browser checks: 320×568, 360×640, 390×844 and 430×932 portrait viewports;
  no audio sources before interaction; actual touch start; falling failure; mute
  without unintended start; ten clean replays with no old audio sources; visibility
  pause of physics/audio and clean resume; actual obstacle collision; a complete
  winning route with all 15 obstacles seen/passed; host click tag and new window
  with no opener; no JavaScript page errors.
- Fireplace browser checks: independent documents; finished animation visibility
  regression; shared start timestamp; reduced motion with zero active effects.
  Additional development checks covered exact creative sizes, identical background
  transforms, ten intro replays without growing animation counts, asset loading,
  preview fitting and clickout propagation.
- Source syntax checks and a combined uncompressed package-size check.

The deterministic browser route freezes the test clock and advances it explicitly.
This avoids accidentally adding wall-clock time between touch events. Gameplay
itself uses the ordinary fixed-step RAF loop, without a skip-to-win test hook.

## Visual review

Reviewed start/fail/win game screenshots and Fireplace final/mid-intro compositions.
The game scene is clipped below the headline so moving gut artwork cannot cover
the header. Portrait bounds are checked after resizing, including the 320 px case.
Endcard layers and button positions follow source artwork coordinates divided by
two. The same alpha masks used for collision can be viewed with `?debug=1`.

## Limits of verification

Desktop Google Chrome and mobile viewport emulation were used. Viewport emulation
does not replace testing browser toolbars, safe areas and sound on physical iOS
and Android hardware. No claim of an average-laptop hardware benchmark is made.
The animations use transform/opacity and decoded local assets to keep work small.

Exact B visual matching remains limited by inconsistent supplied master/precuts
and top-headline wording. The source discrepancy is documented in README and
DECISIONS; correct exports or recruiter confirmation are still needed for exact
visual sign-off. No replacement campaign art has been generated.

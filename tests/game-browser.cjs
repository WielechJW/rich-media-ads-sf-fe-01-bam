const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const taps = require('./winning-route.json');
const base = (process.env.TEST_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/variant-a-game/?debug=1`);
    await page.waitForFunction(() => window.gutRunDebug);
    const snapshot = () => page.evaluate(() => window.gutRunDebug.snapshot());
    assert.equal((await snapshot()).audioSources, 0);
    for (const [width, height] of [[320,568],[360,640],[390,844],[430,932]]) {
      await page.setViewportSize({ width, height });
      await page.waitForFunction(() => {
        const bounds = document.querySelector('.stage').getBoundingClientRect();
        return bounds.left >= -.5 && bounds.right <= innerWidth + .5 && bounds.top >= -.5 && bounds.bottom <= innerHeight + .5;
      });
    }
    await page.setViewportSize({ width: 360, height: 640 });
    console.log('Game: all portrait viewports fit, with no audio before interaction.');
    const clockStart = new Date('2026-11-05T12:00:00Z');
    await page.clock.install({ time: clockStart });
    await page.clock.pauseAt(new Date(clockStart.getTime() + 1000));
    const start = () => page.touchscreen.tap(180, 400);
    const fail = async () => {
      await start();
      await page.clock.runFor(1800);
      assert.equal((await snapshot()).state, 'fail');
    };
    await fail();
    await page.screenshot({ path: '/tmp/gut-fail.png' });
    await page.locator('.replay').click();
    await page.locator('.mute').click();
    assert.equal((await snapshot()).state, 'start');
    assert.equal((await snapshot()).muted, true);
    for (let count = 0; count < 10; count++) {
      await fail();
      await page.locator('.replay').click();
      const reset = await snapshot();
      assert.equal(reset.state, 'start');
      assert.equal(reset.distance, 0);
      assert.equal(reset.audioSources, 0);
      assert.deepEqual(reset.seen, []);
    }
    console.log('Game: falling fails; mute does not start a round; ten replays reset gameplay and audio.');

    await start();
    await page.clock.runFor(250);
    await page.evaluate(() => {
      window.testHidden = true;
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => window.testHidden });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    const paused = await snapshot();
    await page.clock.runFor(1000);
    assert.equal((await snapshot()).distance, paused.distance);
    assert.equal((await snapshot()).paused, true);
    assert.equal((await snapshot()).audioState, 'suspended');
    await page.evaluate(() => { window.testHidden = false; document.dispatchEvent(new Event('visibilitychange')); });
    await page.clock.runFor(160);
    const resumed = await snapshot();
    assert(resumed.distance > paused.distance && resumed.distance - paused.distance < 20);
    await page.clock.runFor(2000);
    await page.locator('.replay').click();
    console.log('Game: visibility pause stops physics and audio; resume has no time jump.');

    await start();
    await page.clock.runFor(16);
    let previous = 0;
    for (const tick of taps) {
      const time = tick / 120 * 1000;
      await page.clock.runFor(time - previous);
      await start();
      previous = time;
      const current = await snapshot();
      assert.equal(current.state, 'playing', `Recorded route failed: ${JSON.stringify(current)}`);
    }
    await page.clock.runFor(35000 - previous);
    const won = await snapshot();
    assert.equal(won.state, 'win');
    assert.equal(won.seen.length, 15);
    assert.equal(won.passed.length, 15);
    await page.screenshot({ path: '/tmp/gut-win.png' });
    console.log('Game: a full real-input route wins after all 15 obstacles pass.');

    await context.route('https://example.com/**', route => route.fulfill({ status: 200, body: 'Test landing' }));
    await page.evaluate(() => { window.clickTag = 'https://example.com/gut-test'; });
    const [popup] = await Promise.all([page.waitForEvent('popup'), page.locator('.win-cta').click()]);
    await popup.waitForLoadState();
    assert.equal(popup.url(), 'https://example.com/gut-test');
    assert.equal(await popup.evaluate(() => window.opener), null);
    await popup.close();
    assert.deepEqual(errors, []);
    console.log('Game: endcard clickout uses the host tag in a new window; no script errors.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = (process.env.TEST_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1750, height: 1120 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const part of ['left', 'top', 'right']) {
      await page.goto(`${base}/variant-b-fireplace/${part}.html`);
      await page.waitForFunction(() => document.querySelector('.creative')?.dataset.startedAt);
      const result = await page.evaluate(async () => {
        const animations = document.getAnimations();
        for (const animation of animations) animation.finish();
        let hidden = true;
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
        document.dispatchEvent(new Event('visibilitychange'));
        await new Promise(requestAnimationFrame);
        hidden = false;
        document.dispatchEvent(new Event('visibilitychange'));
        await new Promise(requestAnimationFrame);
        return animations.map(animation => animation.playState);
      });
      assert(result.every(state => state === 'finished'), `${part}: completed intro must stay finished after visibility change`);
    }
    await page.goto(`${base}/variant-b-fireplace/preview.html`);
    await page.waitForFunction(() => [...document.querySelectorAll('iframe')].every(frame => frame.contentDocument?.querySelector('.creative')?.dataset.startedAt));
    const starts = await page.evaluate(() => [...document.querySelectorAll('iframe')].map(frame => frame.contentDocument.querySelector('.creative').dataset.startedAt));
    assert.equal(new Set(starts).size, 1);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => [...document.querySelectorAll('iframe')].every(frame => frame.contentDocument.getAnimations().length === 0));
    assert.deepEqual(errors, []);
    console.log('Fireplace: completed animations remain finished; synchronized start; reduced motion; no script errors.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

const slots = [...document.querySelectorAll('iframe')];
const readySlots = new Set();
const stage = document.querySelector('.stage');
const shell = document.querySelector('.stage-shell');
const area = document.querySelector('.preview-area');
const actualSize = document.querySelector('#actual-size');
const replay = document.querySelector('#replay');
const params = new URLSearchParams(location.search);

if (params.has('still')) {
  for (const frame of slots) frame.src += '&still=1';
}

function fit() {
  const styles = getComputedStyle(area);
  const available = area.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
  const scale = actualSize.checked ? 1 : Math.min(1, available / 1672);
  stage.style.transform = `scale(${scale})`;
  shell.style.width = `${1672 * scale}px`;
  shell.style.height = `${975 * scale}px`;
}

function startAll() {
  const startAt = Date.now() + 120;
  for (const frame of slots) {
    frame.contentWindow.postMessage({
      type: 'fireplace:start',
      startAt,
      clickTag: window.clickTag || 'https://example.com/landing',
    }, location.origin);
  }
}

window.addEventListener('message', (event) => {
  if (event.origin !== location.origin || event.data?.type !== 'fireplace:ready') return;
  const frame = slots.find((slot) => slot.contentWindow === event.source);
  if (!frame) return;
  readySlots.add(frame);
  replay.disabled = readySlots.size !== slots.length;
  if (readySlots.size === slots.length) startAll();
});

replay.disabled = true;
replay.addEventListener('click', startAll);
actualSize.addEventListener('change', fit);
new ResizeObserver(fit).observe(area);
fit();

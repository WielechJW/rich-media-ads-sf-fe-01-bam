export class AudioManager {
  constructor() {
    this.context = null;
    this.gain = null;
    this.buffers = new Map();
    this.sources = new Set();
    this.unlocked = false;
    this.muted = false;
  }

  async load() {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    this.context = new Context();
    this.gain = this.context.createGain();
    this.gain.connect(this.context.destination);
    await Promise.all(['music', 'crash', 'fail', 'cheer', 'applause'].map(async name => {
      const response = await fetch(`creative-assets/audio/${name}.mp3`);
      if (!response.ok) throw new Error(`Audio could not load: ${name}`);
      const buffer = await this.context.decodeAudioData(await response.arrayBuffer());
      this.buffers.set(name, buffer);
    }));
  }

  unlock() {
    this.unlocked = true;
    if (this.context?.state === 'suspended') this.context.resume().catch(() => {});
  }

  play(name, { loop = false, volume = 1 } = {}) {
    if (!this.context || !this.buffers.has(name) || !this.unlocked) return;
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = this.buffers.get(name);
    source.loop = loop;
    gain.gain.value = volume;
    source.connect(gain).connect(this.gain);
    source.onended = () => {
      this.sources.delete(source);
      source.disconnect();
      gain.disconnect();
    };
    this.sources.add(source);
    source.start();
  }

  stop() {
    for (const source of this.sources) {
      try { source.stop(); } catch {}
    }
    this.sources.clear();
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.gain) this.gain.gain.value = this.muted ? 0 : 1;
    return this.muted;
  }

  pause() {
    if (this.context?.state === 'running') this.context.suspend().catch(() => {});
  }

  resume() {
    if (this.unlocked && this.context?.state === 'suspended') this.context.resume().catch(() => {});
  }
}

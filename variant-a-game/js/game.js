import { LEVEL, PLAYER, PLAYFIELD, TRACK_LENGTH, GRAVITY, JUMP } from './level.js';

export function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x
    && a.y < b.y + b.height && a.y + a.height > b.y;
}

export class Game {
  constructor(collision = overlaps) {
    this.collision = collision;
    this.reset();
  }

  reset() {
    this.state = 'start';
    this.player = { ...PLAYER, velocity: 0 };
    this.distance = 0;
    this.elapsed = 0;
    this.reason = null;
    this.seen = new Set();
    this.passed = new Set();
  }

  start() {
    if (this.state !== 'start') return;
    this.state = 'playing';
    // The measured tutorial position is near the upper edge. A gentle first
    // impulse gives the player room to react before the regular jump input.
    this.player.velocity = -120;
  }

  jump() {
    if (this.state === 'playing') this.player.velocity = JUMP;
  }

  step(dt) {
    if (this.state !== 'playing') return;
    this.elapsed += dt;
    this.distance += (72 + Math.min(12, this.elapsed * .4)) * dt;
    this.player.velocity += GRAVITY * dt;
    this.player.y += this.player.velocity * dt;
    if (this.player.y < PLAYFIELD.top || this.player.y + this.player.height > PLAYFIELD.bottom) {
      this.state = 'fail';
      this.reason = 'boundary';
      return;
    }
    for (const obstacle of this.obstacles()) {
      if (obstacle.x < 360 && obstacle.x + obstacle.width > 0) this.seen.add(obstacle.id);
      if (obstacle.x + obstacle.width < 0) this.passed.add(obstacle.id);
      if (overlaps(this.player, obstacle) && this.collision(this.player, obstacle)) {
        this.state = 'fail';
        this.reason = 'obstacle';
        return;
      }
    }
    if (this.distance + this.player.x + this.player.width / 2 >= TRACK_LENGTH
      && this.passed.size === LEVEL.length) this.state = 'win';
  }

  obstacles() {
    return LEVEL.map(obstacle => ({ ...obstacle, x: obstacle.x - this.distance }));
  }

  snapshot() {
    return {
      state: this.state, reason: this.reason, elapsed: this.elapsed, distance: this.distance,
      player: { ...this.player }, obstacles: this.obstacles(),
      seen: [...this.seen], passed: [...this.passed],
    };
  }
}

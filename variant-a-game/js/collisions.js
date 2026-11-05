// Decode alpha once. The game never reads pixels from the main canvas per frame.
export function createMask(image, inset = 0) {
  const width = Math.ceil(image.naturalWidth / 2);
  const height = Math.ceil(image.naturalHeight / 2);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0, width, height);
  const rgba = context.getImageData(0, 0, width, height).data;
  const data = new Uint8Array(width * height);
  for (let y = inset; y < height - inset; y++) {
    for (let x = inset; x < width - inset; x++) {
      let opaque = true;
      for (let dy = -inset; dy <= inset && opaque; dy++) {
        for (let dx = -inset; dx <= inset; dx++) {
          if (rgba[((y + dy) * width + x + dx) * 4 + 3] < 150) {
            opaque = false;
            break;
          }
        }
      }
      data[y * width + x] = opaque ? 1 : 0;
    }
  }
  const overlay = context.createImageData(width, height);
  for (let index = 0; index < data.length; index++) {
    overlay.data.set([30, 255, 130, data[index] ? 150 : 0], index * 4);
  }
  context.putImageData(overlay, 0, 0);
  return { width, height, data, canvas };
}

export function masksOverlap(a, b, first, second) {
  const left = Math.ceil(Math.max(a.x, b.x));
  const right = Math.floor(Math.min(a.x + a.width, b.x + b.width));
  const top = Math.ceil(Math.max(a.y, b.y));
  const bottom = Math.floor(Math.min(a.y + a.height, b.y + b.height));
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      const ax = Math.min(first.width - 1, Math.floor((x - a.x) / a.width * first.width));
      const ay = Math.min(first.height - 1, Math.floor((y - a.y) / a.height * first.height));
      const bx = Math.min(second.width - 1, Math.floor((x - b.x) / b.width * second.width));
      const by = Math.min(second.height - 1, Math.floor((y - b.y) / b.height * second.height));
      if (first.data[ay * first.width + ax] && second.data[by * second.width + bx]) return true;
    }
  }
  return false;
}

export const WIDTH = 360;
export const HEIGHT = 640;
export const PLAYFIELD = { top: 238, bottom: 572 };
export const PLAYER = { x: 55.5, y: 258.5, width: 42, height: 41 };
export const TRACK_LENGTH = 2528;
export const GRAVITY = 420;
export const JUMP = -205;

// Dimensions are the supplied 2x sprites divided by two. Each ID occurs once.
const sprites = [
  ['bac4', 69, 34], ['txt1', 23, 94], ['bac2', 21.5, 77],
  ['txt2', 34, 113], ['bac1', 62.5, 59.5], ['txt3', 23.5, 60.5],
  ['bac3', 79, 28], ['txt4', 29, 84.5], ['bac5', 53.5, 43.5],
  ['txt5', 30, 181], ['bac6', 50, 47.5], ['txt6', 20.5, 144.5],
  ['txt7', 29.5, 81.5], ['txt8', 18.5, 153], ['txt9', 25.5, 156.5],
];

export const LEVEL = sprites.map(([id, width, height], index) => ({
  id, width, height,
  x: 400 + index * 140,
  y: index % 2 === 0 ? PLAYFIELD.top + 4 : PLAYFIELD.bottom - height - 4,
}));

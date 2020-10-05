export const genVarInt = (num: number): Buffer => {
  if (num < 128) return Buffer.from([num]);
  if (num < 16_384) return Buffer.from([
    0b10000000 | (num & 0b01111111),
    (num >> 7) & 0b01111111,
  ]);
  if (num < 2_097_152) return Buffer.from([
    0b10000000 | (num & 0b01111111),
    0b10000000 | ((num >> 7) & 0b01111111),
    (num >> 14) & 0b01111111,
  ]);
  return Buffer.from([
    0b10000000 | (num & 0b01111111),
    0b10000000 | ((num >> 7) & 0b01111111),
    0b10000000 | ((num >> 14) & 0b01111111),
    (num >> 21) & 0b01111111,
  ]);
};

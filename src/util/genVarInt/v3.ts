export const genVarInt = (num: number): Buffer => {
  const b1 = num & 0b01111111;
  const b2 = (num >> 7) & 0b01111111;
  const b3 = (num >> 14) & 0b01111111;
  const b4 = (num >> 21) & 0b01111111;
  if (b4) return Buffer.from([b1 | 0b10000000, b2 | 0b10000000, b3 | 0b10000000, b4]);
  if (b3) return Buffer.from([b1 | 0b10000000, b2 | 0b10000000, b3]);
  if (b2) return Buffer.from([b1 | 0b10000000, b2]);
  return Buffer.from([b1]);
};

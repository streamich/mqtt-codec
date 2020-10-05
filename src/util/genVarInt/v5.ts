export const genVarInt = (num: number): Buffer => {
  if (num < 128) {
    return Buffer.from([num]);
  }

  if (num < 16_384) {
    const int = ((num & 0b011111110000000) << 1) | (0b10000000 | (num & 0b01111111));
    const buf = Buffer.allocUnsafe(2);
    buf.writeUInt16LE(int, 0);
    return buf;
  }

  if (num < 2_097_152) {
    const buf = Buffer.allocUnsafe(3);
    buf.writeUInt16LE(((0b100000000000000 | (num & 0b011111110000000)) << 1) | (0b10000000 | (num & 0b01111111)), 0);
    buf.writeUInt8((num >> 14) & 0b01111111, 2);
    return buf;
  }

  const buf = Buffer.allocUnsafe(4);
  buf.writeUInt16LE(((0b100000000000000 | (num & 0b011111110000000)) << 1) | (0b10000000 | (num & 0b01111111)), 0);
  buf.writeUInt16LE((((num >> 21) & 0b01111111) << 8) | (0b10000000 | ((num >> 14) & 0b01111111)), 2);
  return buf;
};

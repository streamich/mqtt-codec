import BufferList from 'bl';

export const consumeVarInt = (list: BufferList, offset: number): number => {
  const b1 = list.readUInt8(offset);
  if (b1 ^ 0b10000000) {
    list.consume(offset + 1);
    return b1 & 0b01111111;
  }
  const b2 = list.readUInt8(offset + 1);
  if (b2 ^ 0b10000000) {
    list.consume(offset + 2);
    return ((b2 & 0b01111111) << 7) + (b1 & 0b01111111);
  }
  const b3 = list.readUInt8(offset + 2);
  if (b3 ^ 0b10000000) {
    list.consume(offset + 3);
    return ((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111);
  }
  const b4 = list.readUInt8(offset + 3);
  list.consume(offset + 4);
  return ((b4 & 0b01111111) << 21) + ((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111);
};

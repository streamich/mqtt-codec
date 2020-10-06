import {BufferLike} from '../types';

export const parseVarInt = (data: BufferLike, offset: number): [int: number, size: number] => {
  const b1 = data.readUInt8(offset);
  if (!(b1 & 0b10000000)) return [b1 & 0b01111111, 1];
  const b2 = data.readUInt8(offset + 1);
  if (!(b2 & 0b10000000)) return [((b2 & 0b01111111) << 7) + (b1 & 0b01111111), 2];
  const b3 = data.readUInt8(offset + 2);
  if (!(b3 & 0b10000000)) return [((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111), 3];
  const b4 = data.readUInt8(offset + 3);
  return [((b4 & 0b01111111) << 21) + ((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111), 4];
};

export const parseBinary = (list: BufferLike, offset: number): Buffer => {
  const stringOffset = offset + 2;
  const dataLength = list.readUInt16BE(offset);
  return list.slice(stringOffset, stringOffset + dataLength);
};

import {PacketPubackData} from '.';
import {genProps} from '../../util/genProps';

export const encodePuback = (packet: PacketPubackData, version: number): Buffer => {
  const {b, i, c, p} = packet;
  const isV5 = version === 5;
  const reasonCodeLength = isV5 ? 1 : 0;
  const props = isV5 ? genProps(p) : null;
  const propsLength = props ? props.length : 0;
  const remainingLength: number = packet.l = 2 + reasonCodeLength + propsLength;
  const remainingLengthSize = remainingLength < 128 ? 1 : remainingLength < 16_384 ? 2 : remainingLength < 2_097_152 ? 3 : 4;
  const bufferLength = 1 + remainingLengthSize + remainingLength;
  const buf = Buffer.allocUnsafe(bufferLength);

  buf.writeUInt8(b, 0);

  let offset = 1;

  switch (remainingLengthSize) {
    case 1:
      buf.writeUInt8(remainingLength, 1);
      offset = 2;
      break;
    case 2:
      buf.writeUInt16LE(((remainingLength & 0b011111110000000) << 1) | (0b10000000 | (remainingLength & 0b01111111)), 1);
      offset = 3;
      break;
    case 3:
      buf.writeUInt16LE(((0b100000000000000 | (remainingLength & 0b011111110000000)) << 1) | (0b10000000 | (remainingLength & 0b01111111)), 1);
      buf.writeUInt8((remainingLength >> 14) & 0b01111111, 3);
      offset = 4;
      break;
    case 4:
      buf.writeUInt32LE((((((remainingLength >> 21) & 0b01111111) << 8) | (0b10000000 | ((remainingLength >> 14) & 0b01111111))) << 16) |
        ((0b100000000000000 | (remainingLength & 0b011111110000000)) << 1) | (0b10000000 | (remainingLength & 0b01111111)), 1);
      offset = 5;
      break;
  }

  buf.writeUInt16BE(i, offset);
  offset += 2;

  if (isV5) {
    buf.writeUInt8(c, offset);
    offset += 1;
    props!.copy(buf, offset);
  }

  return buf;
}

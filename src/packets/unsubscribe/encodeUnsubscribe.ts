import {PacketUnsubscribe} from '.';
import {genProps} from '../../util/genProps';

export const encodeUnsubscribe = (packet: PacketUnsubscribe, version: number): Buffer => {
  const {b, i, p, s} = packet;
  const isV5 = version === 5;
  const props = isV5 ? genProps(p) : null;
  const propsLength = props ? props.length : 0;

  let remainingLength: number = 2 + propsLength;
  for (const topic of s) remainingLength += 2 + Buffer.byteLength(topic);

  const remainingLengthSize = remainingLength < 128 ? 1 : remainingLength < 16_384 ? 2 : remainingLength < 2_097_152 ? 3 : 4;
  const bufferLength = 1 + remainingLengthSize + remainingLength;
  const buf = Buffer.allocUnsafe(bufferLength);

  packet.l = remainingLength;

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
    props!.copy(buf, offset);
    offset += propsLength;
  }

  for (const topic of s) {
    const len = Buffer.byteLength(topic);
    buf.writeUInt16BE(len, offset);
    offset += 2;
    buf.write(topic, offset);
    offset += len;
  }

  return buf;
}

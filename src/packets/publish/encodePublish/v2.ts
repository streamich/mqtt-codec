import {getPropsLen} from '../../../util/genProps/getPropsLen';
import {writeProps} from '../../../util/genProps/writeProps';
import {PacketPublish} from '../../publish';

export const encodePublish = (packet: PacketPublish, version: number): Buffer => {
  const payload = packet.d;
  const lenTopic = Buffer.byteLength(packet.t);
  const isQosHigh = packet.qualityOfService() > 0;
  const emitProps = version === 5;
  const propsSize = emitProps ? getPropsLen(packet.p) : 0;
  const remainingLength: number =
    2 + lenTopic +            // topic length
    (isQosHigh ? 2 : 0) +     // packet ID
    propsSize +               // properties
    payload.length;           // payload length
  const remainingLengthSize = remainingLength < 128 ? 1 : remainingLength < 16_384 ? 2 : remainingLength < 2_097_152 ? 3 : 4;
  const bufferLength = 1 + remainingLengthSize + remainingLength;
  const buf = Buffer.allocUnsafe(bufferLength);
  packet.l = remainingLength;
  
  buf.writeUInt8(packet.b, 0);

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

  buf.writeUInt16BE(lenTopic, offset);
  offset += 2;
  buf.write(packet.t, offset);
  offset += lenTopic;

  if (isQosHigh) {
    buf.writeUInt16BE(packet.i, offset);
    offset += 2;
  }

  if (emitProps) {
    writeProps(packet.p!, buf, offset, propsSize);
    offset += propsSize;
  }

  payload.copy(buf, offset);
  // offset += payload.length;

  return buf;
}

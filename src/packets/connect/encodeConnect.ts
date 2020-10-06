import {genProps} from '../../util/genProps';
import {PacketConnect} from '../connect';

// "MQTT" string with 2 byte length prefix
const bufferMQTT = Buffer.from([0, 4, 0x4d, 0x51, 0x54, 0x54]);

export const encodeConnect = (packet: PacketConnect): Buffer => {
  const {b, f, id, v, k, p, w, wt, wp, usr, pwd} = packet;
  const hasWill = packet.willFlag();
  const hasUserName = packet.userNameFlag();
  const hasPassword = packet.passwordFlag();

  const isV5 = v === 5;
  const props = isV5 ? genProps(p) : null;
  const propsLength = props ? props.length : 0;
  const willProps = (isV5 && hasWill) ? genProps(wp!) : null;
  const willPropsLength = hasWill ? willProps!.length : 0;
  const willTopicLength: number = hasWill ? Buffer.byteLength(wt!) : 0;
  const willPayloadLength: number = hasWill ? w!.length : 0;
  const lenClientId = Buffer.byteLength(id);
  const userNameLength = hasUserName ? Buffer.byteLength(usr!) : 0;
  const passwordLength = hasPassword ? Buffer.byteLength(pwd!) : 0;

  const remainingLength: number =
    2 + 4 +                                     // "MQTT" string and string length prefix
    1 +                                         // Protocol Version
    1 +                                         // Connection flags
    2 +                                         // Keep-alive
    (isV5 ? propsLength : 0) +                  // Properties
    2 + lenClientId +                           // Client ID
    (hasWill ? (
      willPropsLength +                         // Will props
      2 + willTopicLength +                     // Will topic
      2 + willPayloadLength                     // Will payload
    ) : 0) +
    (hasUserName ? (2 + userNameLength) : 0) +    // Username
    (hasPassword ? (2 + passwordLength) : 0);     // Password

  packet.l = remainingLength;
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

  bufferMQTT.copy(buf, offset);
  offset += 6;

  buf.writeUInt8(v, offset);
  offset += 1;

  buf.writeUInt8(f, offset);
  offset += 1;

  buf.writeUInt16BE(k, offset);
  offset += 2;

  if (isV5) {
    props!.copy(buf, offset);
    offset+= propsLength;
  }

  buf.writeUInt16BE(lenClientId, offset);
  offset += 2;
  buf.write(id, offset);
  offset += lenClientId;

  if (hasWill) {
    if (isV5) {
      willProps!.copy(buf, offset);
      offset += willPropsLength;
    }
    buf.writeUInt16BE(willTopicLength, offset);
    offset += 2;
    buf.write(wt!, offset);
    offset += willTopicLength;
    buf.writeUInt16BE(willPayloadLength, offset);
    offset += 2;
    w!.copy(buf, offset);
    offset += willPayloadLength;
  }

  if (hasUserName) {
    buf.writeUInt16BE(userNameLength, offset);
    offset += 2;
    buf.write(usr!, offset);
    offset += userNameLength;
  }

  if (hasPassword) {
    buf.writeUInt16BE(passwordLength, offset);
    offset += 2;
    pwd!.copy(buf, offset);
    offset += passwordLength;
  }

  return buf;
}

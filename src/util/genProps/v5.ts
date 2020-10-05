import { PROPERTY } from '../../enums';
import {Properties} from '../../types';
import {genVarInt} from '../genVarInt/v5';

export const genProps = (props: Properties): Buffer => {
  let value: any;
  let maxBufferSize =
    4 +                 // Max variable byte size of props.
    (8 * (1 + 1)) +     // Max one byte fields size.
    (4 * (1 + 2)) +     // Max two byte fields size.
    (4 * (1 + 4)) +     // Max four byte fields size.
    (1 * (1 + 4));      // Max variable int fields size.

  // Binary data
  value = props[PROPERTY.CorrelationData];
  if (value) maxBufferSize += 1 + 2 + value.length;
  value = props[PROPERTY.AuthenticationData];
  if (value) maxBufferSize += 1 + 2 + value.length;

  // Strings
  value = props[PROPERTY.ContentType];
  if (value) maxBufferSize += 1 + 2 + Buffer.byteLength(value);
  value = props[PROPERTY.ResponseTopic];
  if (value) maxBufferSize += 1 + 2 + Buffer.byteLength(value);
  value = props[PROPERTY.AssignedClientIdentifier];
  if (value) maxBufferSize += 1 + 2 + Buffer.byteLength(value);
  value = props[PROPERTY.AuthenticationMethod];
  if (value) maxBufferSize += 1 + 2 + Buffer.byteLength(value);
  value = props[PROPERTY.ResponseInformation];
  if (value) maxBufferSize += 1 + 2 + Buffer.byteLength(value);
  value = props[PROPERTY.ServerReference];
  if (value) maxBufferSize += 1 + 2 + Buffer.byteLength(value);
  value = props[PROPERTY.ReasonString];
  if (value) maxBufferSize += 1 + 2 + Buffer.byteLength(value);

  // User properties
  value = props[PROPERTY.UserProperty];
  if (value)
    for (const [k, v] of value)
      maxBufferSize += 1 + 2 + Buffer.byteLength(k) + 2 + Buffer.byteLength(v);

  const buf = Buffer.allocUnsafe(maxBufferSize);
  let offset = 0;

  // Write properties variable length
  // if (maxBufferSize < 128) {
  //   buf.writeUInt8(maxBufferSize)
  // }

  // if (num < 16_384) {
  //   const int = ((num & 0b011111110000000) << 1) | (0b10000000 | (num & 0b01111111));
  //   const buf = Buffer.allocUnsafe(2);
  //   buf.writeUInt16LE(int, 0);
  //   return buf;
  // }

  // if (num < 2_097_152) {
  //   const buf = Buffer.allocUnsafe(3);
  //   buf.writeUInt16LE(((0b100000000000000 | (num & 0b011111110000000)) << 1) | (0b10000000 | (num & 0b01111111)), 0);
  //   buf.writeUInt8((num >> 14) & 0b01111111, 2);
  //   return buf;
  // }

  // const buf = Buffer.allocUnsafe(4);
  // buf.writeUInt32LE((((((num >> 21) & 0b01111111) << 8) | (0b10000000 | ((num >> 14) & 0b01111111))) << 16) |
  //   ((0b100000000000000 | (num & 0b011111110000000)) << 1) | (0b10000000 | (num & 0b01111111)), 0);

  // 1 byte properties
  value = props[PROPERTY.PayloadFormatIndicator];
  if (value !== undefined) {
    buf.writeUInt8(PROPERTY.PayloadFormatIndicator, offset++);
    buf.writeUInt8(value, offset++);
  }
  value = props[PROPERTY.RequestProblemInformation];
  if (value !== undefined) {
    buf.writeUInt8(PROPERTY.RequestProblemInformation, offset++);
    buf.writeUInt8(value, offset++);
  }
  value = props[PROPERTY.RequestResponseInformation];
  if (value !== undefined) {
    buf.writeUInt8(PROPERTY.RequestResponseInformation, offset++);
    buf.writeUInt8(value, offset++);
  }
  value = props[PROPERTY.MaximumQoS];
  if (value !== undefined) {
    buf.writeUInt8(PROPERTY.MaximumQoS, offset++);
    buf.writeUInt8(value, offset++);
  }
  value = props[PROPERTY.RetainAvailable];
  if (value !== undefined) {
    buf.writeUInt8(PROPERTY.RetainAvailable, offset++);
    buf.writeUInt8(value, offset++);
  }
  value = props[PROPERTY.WildcardSubscriptionAvailable];
  if (value !== undefined) {
    buf.writeUInt8(PROPERTY.WildcardSubscriptionAvailable, offset++);
    buf.writeUInt8(value, offset++);
  }
  value = props[PROPERTY.SubscriptionIdentifierAvailable];
  if (value !== undefined) {
    buf.writeUInt8(PROPERTY.SubscriptionIdentifierAvailable, offset++);
    buf.writeUInt8(value, offset++);
  }
  value = props[PROPERTY.SharedSubscriptionAvailable];
  if (value !== undefined) {
    buf.writeUInt8(PROPERTY.SharedSubscriptionAvailable, offset++);
    buf.writeUInt8(value, offset++);
  }

  // 2 byte properties
  value = props[PROPERTY.ServerKeepAlive];
  if (value !== undefined) {
    buf.writeUInt8(PROPERTY.ServerKeepAlive, offset++);
    buf.writeUInt16BE(value, offset);
    offset += 2;
  }
  value = props[PROPERTY.ReceiveMaximum];
  if (value !== undefined) {
    buf.writeUInt8(PROPERTY.ReceiveMaximum, offset++);
    buf.writeUInt16BE(value, offset);
    offset += 2;
  }
  value = props[PROPERTY.TopicAliasMaximum];
  if (value !== undefined) {
    buf.writeUInt8(PROPERTY.TopicAliasMaximum, offset++);
    buf.writeUInt16BE(value, offset);
    offset += 2;
  }
  value = props[PROPERTY.TopicAlias];
  if (value !== undefined) {
    buf.writeUInt8(PROPERTY.TopicAlias, offset++);
    buf.writeUInt16BE(value, offset);
    offset += 2;
  }

  // 4 byte properties
  value = props[PROPERTY.MessageExpiryInterval];
  if (value !== undefined) {
    buf.writeUInt8(PROPERTY.MessageExpiryInterval, offset++);
    buf.writeUInt32BE(value, offset);
    offset += 4;
  }
  value = props[PROPERTY.WillDelayInterval];
  if (value !== undefined) {
    buf.writeUInt8(PROPERTY.WillDelayInterval, offset++);
    buf.writeUInt32BE(value, offset);
    offset += 4;
  }
  value = props[PROPERTY.SessionExpiryInterval];
  if (value !== undefined) {
    buf.writeUInt8(PROPERTY.SessionExpiryInterval, offset++);
    buf.writeUInt32BE(value, offset);
    offset += 4;
  }
  value = props[PROPERTY.MaximumPacketSize];
  if (value !== undefined) {
    buf.writeUInt8(PROPERTY.MaximumPacketSize, offset++);
    buf.writeUInt32BE(value, offset);
    offset += 4;
  }

  // Variable length integers
  value = props[PROPERTY.SubscriptionIdentifier];
  if (value !== undefined) {
    const int = genVarInt(value);
    buf.writeUInt8(PROPERTY.SubscriptionIdentifier, offset++);
    int.copy(buf, offset);
    offset += int.length;
  }

  // Binary data
  value = props[PROPERTY.CorrelationData];
  if (value) {
    buf.writeUInt8(PROPERTY.CorrelationData, offset++);
    buf.writeUInt16BE(value.length, offset);
    offset += 2;
    value.copy(buf, offset);
    offset += value.length;
  }
  value = props[PROPERTY.AuthenticationData];
  if (value) {
    buf.writeUInt8(PROPERTY.AuthenticationData, offset++);
    buf.writeUInt16BE(value.length, offset);
    offset += 2;
    value.copy(buf, offset);
    offset += value.length;
  }

  // Strings
  value = props[PROPERTY.ContentType];
  if (value !== undefined) {
    const len = Buffer.byteLength(value);
    buf.writeUInt8(PROPERTY.ContentType, offset++);
    buf.writeUInt16BE(len, offset);
    offset += 2;
    buf.write(value, offset);
    offset += len;
  }
  value = props[PROPERTY.ResponseTopic];
  if (value !== undefined) {
    const len = Buffer.byteLength(value);
    buf.writeUInt8(PROPERTY.ResponseTopic, offset++);
    buf.writeUInt16BE(len, offset);
    offset += 2;
    buf.write(value, offset);
    offset += len;
  }
  value = props[PROPERTY.AssignedClientIdentifier];
  if (value !== undefined) {
    const len = Buffer.byteLength(value);
    buf.writeUInt8(PROPERTY.AssignedClientIdentifier, offset++);
    buf.writeUInt16BE(len, offset);
    offset += 2;
    buf.write(value, offset);
    offset += len;
  }
  value = props[PROPERTY.AuthenticationMethod];
  if (value !== undefined) {
    const len = Buffer.byteLength(value);
    buf.writeUInt8(PROPERTY.AuthenticationMethod, offset++);
    buf.writeUInt16BE(len, offset);
    offset += 2;
    buf.write(value, offset);
    offset += len;
  }
  value = props[PROPERTY.ResponseInformation];
  if (value !== undefined) {
    const len = Buffer.byteLength(value);
    buf.writeUInt8(PROPERTY.ResponseInformation, offset++);
    buf.writeUInt16BE(len, offset);
    offset += 2;
    buf.write(value, offset);
    offset += len;
  }
  value = props[PROPERTY.ServerReference];
  if (value !== undefined) {
    const len = Buffer.byteLength(value);
    buf.writeUInt8(PROPERTY.ServerReference, offset++);
    buf.writeUInt16BE(len, offset);
    offset += 2;
    buf.write(value, offset);
    offset += len;
  }
  value = props[PROPERTY.ReasonString];
  if (value !== undefined) {
    const len = Buffer.byteLength(value);
    buf.writeUInt8(PROPERTY.ReasonString, offset++);
    buf.writeUInt16BE(len, offset);
    offset += 2;
    buf.write(value, offset);
    offset += len;
  }

  value = props[PROPERTY.UserProperty];
  if (value) {
    for (const [k, v] of value) {
      const kLen = Buffer.byteLength(k);
      const vLen = Buffer.byteLength(v);
      buf.writeUInt8(PROPERTY.UserProperty, offset++);
      buf.writeUInt16BE(kLen, offset);
      offset += 2;
      buf.write(k, offset);
      offset += kLen;
      buf.writeUInt16BE(vLen, offset);
      offset += 2;
      buf.write(v, offset);
      offset += vLen;
    }
  }

  return Buffer.concat([
    genVarInt(offset),
    buf.slice(0, offset),
  ]);
};

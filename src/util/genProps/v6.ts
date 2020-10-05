import { PROPERTY } from '../../enums';
import {Properties} from '../../types';

export const genProps = (props: Properties): Buffer => {
  let value: any;
  let size = 0; // Account for props total length first variable length integer.

  // 1 byte properties
  if (props[PROPERTY.PayloadFormatIndicator] !== undefined) size += 2;
  if (props[PROPERTY.RequestProblemInformation] !== undefined) size += 2;
  if (props[PROPERTY.RequestResponseInformation] !== undefined) size += 2;
  if (props[PROPERTY.MaximumQoS] !== undefined) size += 2;
  if (props[PROPERTY.RetainAvailable] !== undefined) size += 2;
  if (props[PROPERTY.WildcardSubscriptionAvailable] !== undefined) size += 2;
  if (props[PROPERTY.SubscriptionIdentifierAvailable] !== undefined) size += 2;
  if (props[PROPERTY.SharedSubscriptionAvailable] !== undefined) size += 2;

  // 2 byte properties
  if (props[PROPERTY.ServerKeepAlive] !== undefined) size += 3;
  if (props[PROPERTY.ReceiveMaximum] !== undefined) size += 3;
  if (props[PROPERTY.TopicAliasMaximum] !== undefined) size += 3;
  if (props[PROPERTY.TopicAlias] !== undefined) size += 3;

  // 4 byte properties
  if (props[PROPERTY.MessageExpiryInterval] !== undefined) size += 5;
  if (props[PROPERTY.WillDelayInterval] !== undefined) size += 5;
  if (props[PROPERTY.SessionExpiryInterval] !== undefined) size += 5;
  if (props[PROPERTY.MaximumPacketSize] !== undefined) size += 5;

  // Variable length integers
  value = props[PROPERTY.SubscriptionIdentifier];
  if (value !== undefined) {
    if (value < 128) size += 2;
    else if (value < 16_384) size += 3;
    else if (value < 2_097_152) size += 4;
    else size += 5;
  }

  // Binary data
  value = props[PROPERTY.CorrelationData];
  if (value) size += 1 + 2 + value.length;
  value = props[PROPERTY.AuthenticationData];
  if (value) size += 1 + 2 + value.length;

  // Strings
  value = props[PROPERTY.ContentType];
  if (value) size += 1 + 2 + Buffer.byteLength(value);
  value = props[PROPERTY.ResponseTopic];
  if (value) size += 1 + 2 + Buffer.byteLength(value);
  value = props[PROPERTY.AssignedClientIdentifier];
  if (value) size += 1 + 2 + Buffer.byteLength(value);
  value = props[PROPERTY.AuthenticationMethod];
  if (value) size += 1 + 2 + Buffer.byteLength(value);
  value = props[PROPERTY.ResponseInformation];
  if (value) size += 1 + 2 + Buffer.byteLength(value);
  value = props[PROPERTY.ServerReference];
  if (value) size += 1 + 2 + Buffer.byteLength(value);
  value = props[PROPERTY.ReasonString];
  if (value) size += 1 + 2 + Buffer.byteLength(value);

  // User properties
  value = props[PROPERTY.UserProperty];
  if (value)
    for (const [k, v] of value)
      size += 1 + 2 + Buffer.byteLength(k) + 2 + Buffer.byteLength(v);

  let offset = size < 128 ? 1 : size < 16_384 ? 2 : size < 2_097_152 ? 3 : 4;
  const buf = Buffer.allocUnsafe(size + offset);

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
    buf.writeUInt8(PROPERTY.SubscriptionIdentifier, offset++);
    if (value < 128) {
      buf.writeUInt8(value, offset++);
    } else if (value < 16_384) {
      buf.writeUInt16LE(((value & 0b011111110000000) << 1) | (0b10000000 | (value & 0b01111111)), offset);
      offset += 2;
    } else if (value < 2_097_152) {
      buf.writeUInt16LE(((0b100000000000000 | (value & 0b011111110000000)) << 1) | (0b10000000 | (value & 0b01111111)), offset);
      offset += 2;
      buf.writeUInt8((value >> 14) & 0b01111111, offset);
      offset += 1;
    } else {
      buf.writeUInt32LE((((((value >> 21) & 0b01111111) << 8) | (0b10000000 | ((value >> 14) & 0b01111111))) << 16) |
        ((0b100000000000000 | (value & 0b011111110000000)) << 1) | (0b10000000 | (value & 0b01111111)), offset);
      offset += 4;
    }
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

  // Write initial properties variable length integer.
  if (size < 128)
    buf.writeUInt8(size, 0);
  else if (size < 16_384)
    buf.writeUInt16LE(((size & 0b011111110000000) << 1) | (0b10000000 | (size & 0b01111111)), 0);
  else if (size < 2_097_152) {
    buf.writeUInt16LE(((0b100000000000000 | (size & 0b011111110000000)) << 1) | (0b10000000 | (size & 0b01111111)), 0);
    buf.writeUInt8((size >> 14) & 0b01111111, 2);
  } else
    buf.writeUInt32LE((((((size >> 21) & 0b01111111) << 8) | (0b10000000 | ((size >> 14) & 0b01111111))) << 16) |
      ((0b100000000000000 | (size & 0b011111110000000)) << 1) | (0b10000000 | (size & 0b01111111)), 0);

  return buf;
};

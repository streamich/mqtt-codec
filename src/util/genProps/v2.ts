import { PROPERTY } from '../../enums';
import {Properties} from '../../types';
import {genVarInt} from '../genVarInt/v5';

const ONE_BYTE_PROPS = [ // 8
  PROPERTY.PayloadFormatIndicator,
  PROPERTY.RequestProblemInformation,
  PROPERTY.RequestResponseInformation,
  PROPERTY.MaximumQoS,
  PROPERTY.RetainAvailable,
  PROPERTY.WildcardSubscriptionAvailable,
  PROPERTY.SubscriptionIdentifierAvailable,
  PROPERTY.SharedSubscriptionAvailable,  
];

const TWO_BYTE_PROPS = [ // 4
  PROPERTY.ServerKeepAlive,
  PROPERTY.ReceiveMaximum,
  PROPERTY.TopicAliasMaximum,
  PROPERTY.TopicAlias,
];

const FOUR_BYTE_PROPS = [ // 4
  PROPERTY.MessageExpiryInterval,
  PROPERTY.WillDelayInterval,
  PROPERTY.SessionExpiryInterval,
  PROPERTY.MaximumPacketSize,
];

const VAR_BYTE_PROPS = [
  PROPERTY.SubscriptionIdentifier,
];

const BINARY_BYTE_PROPS = [
  PROPERTY.CorrelationData,
  PROPERTY.AuthenticationData,
];

const STRING_BYTE_PROPS = [
  PROPERTY.ContentType,
  PROPERTY.ResponseTopic,
  PROPERTY.AssignedClientIdentifier,
  PROPERTY.AuthenticationMethod,
  PROPERTY.ResponseInformation,
  PROPERTY.ServerReference,
  PROPERTY.ReasonString,
];

// PROPERTY.UserProperty,

export const genProps = (props: Properties): Buffer => {
  const bytes: number[] = [];
  const buffers: Buffer[] = [];
  let buffersSize: number = 0;
  let value: any;
  let maxFixedPropSize = 0;

  for (const id of ONE_BYTE_PROPS) if (props[id] !== undefined) maxFixedPropSize += 2;
  for (const id of TWO_BYTE_PROPS) if (props[id] !== undefined) maxFixedPropSize += 3;
  for (const id of FOUR_BYTE_PROPS) if (props[id] !== undefined) maxFixedPropSize += 5;
  for (const id of VAR_BYTE_PROPS) if (props[id] !== undefined) maxFixedPropSize += 5;
  for (const id of BINARY_BYTE_PROPS) {
    const buf = props[id] as Buffer;
    if (buf) maxFixedPropSize += 3 + buf.length;
  }

  const fixedBuf = Buffer.allocUnsafe(maxFixedPropSize);
  let offset = 0;
  for (const id of ONE_BYTE_PROPS) {
    const val = props[id];
    if (val === undefined) continue;
    fixedBuf.writeUInt8(id, offset);
    offset++;
    fixedBuf.writeUInt8(val as number, offset);
    offset++;
  }
  for (const id of TWO_BYTE_PROPS) {
    const val = props[id];
    if (val === undefined) continue;
    fixedBuf.writeUInt8(id, offset);
    offset++;
    fixedBuf.writeUInt16BE(val as number, offset);
    offset += 2;
  }
  for (const id of FOUR_BYTE_PROPS) {
    const val = props[id];
    if (val === undefined) continue;
    fixedBuf.writeUInt8(id, offset);
    offset++;
    fixedBuf.writeUInt32BE(val as number, offset);
    offset += 4;
  }
  for (const id of VAR_BYTE_PROPS) {
    const val = props[id];
    if (val === undefined) continue;
    fixedBuf.writeUInt8(id, offset);
    offset++;
    const int = genVarInt(val as number);
    const len = int.length;
    int.copy(fixedBuf, offset, 0, len);
    offset += len;
  }
  for (const id of BINARY_BYTE_PROPS) {
    const val = props[id] as Buffer;
    if (!val) continue;
    fixedBuf.writeUInt8(id, offset);
    offset++;
    const len = val.length;
    fixedBuf.writeUInt16BE(len, offset);
    offset += 2;
    val.copy(fixedBuf, offset, 0, len);
    offset += len;
  }

  value = props[PROPERTY.ContentType];
  if (value !== undefined) {
    const buf = Buffer.allocUnsafe(3);
    const buf2 = Buffer.from(value, 'utf8');
    buf.writeUInt8(PROPERTY.ContentType);
    buf.writeUInt16BE(buf2.length, 1);
    buffers.push(buf, buf2);
    buffersSize += 3 + buf2.length;
  }
  value = props[PROPERTY.ResponseTopic];
  if (value !== undefined) {
    const buf = Buffer.allocUnsafe(3);
    const buf2 = Buffer.from(value, 'utf8');
    buf.writeUInt8(PROPERTY.ResponseTopic);
    buf.writeUInt16BE(buf2.length, 1);
    buffers.push(buf, buf2);
    buffersSize += 3 + buf2.length;
  }
  value = props[PROPERTY.AssignedClientIdentifier];
  if (value !== undefined) {
    const buf = Buffer.allocUnsafe(3);
    const buf2 = Buffer.from(value, 'utf8');
    buf.writeUInt8(PROPERTY.AssignedClientIdentifier);
    buf.writeUInt16BE(buf2.length, 1);
    buffers.push(buf, buf2);
    buffersSize += 3 + buf2.length;
  }
  value = props[PROPERTY.AuthenticationMethod];
  if (value !== undefined) {
    const buf = Buffer.allocUnsafe(3);
    const buf2 = Buffer.from(value, 'utf8');
    buf.writeUInt8(PROPERTY.AuthenticationMethod);
    buf.writeUInt16BE(buf2.length, 1);
    buffers.push(buf, buf2);
    buffersSize += 3 + buf2.length;
  }
  value = props[PROPERTY.ResponseInformation];
  if (value !== undefined) {
    const buf = Buffer.allocUnsafe(3);
    const buf2 = Buffer.from(value, 'utf8');
    buf.writeUInt8(PROPERTY.ResponseInformation);
    buf.writeUInt16BE(buf2.length, 1);
    buffers.push(buf, buf2);
    buffersSize += 3 + buf2.length;
  }
  value = props[PROPERTY.ServerReference];
  if (value !== undefined) {
    const buf = Buffer.allocUnsafe(3);
    const buf2 = Buffer.from(value, 'utf8');
    buf.writeUInt8(PROPERTY.ServerReference);
    buf.writeUInt16BE(buf2.length, 1);
    buffers.push(buf, buf2);
    buffersSize += 3 + buf2.length;
  }
  value = props[PROPERTY.ReasonString];
  if (value !== undefined) {
    const buf = Buffer.allocUnsafe(3);
    const buf2 = Buffer.from(value, 'utf8');
    buf.writeUInt8(PROPERTY.ReasonString);
    buf.writeUInt16BE(buf2.length, 1);
    buffers.push(buf, buf2);
    buffersSize += 3 + buf2.length;
  }

  value = props[PROPERTY.UserProperty];
  if (value) {
    const len = value!.length;
    for (let i = 0; i < len; i += 2) {
      const k = value![i];
      const v = value![i + 1];
      const buf1 = Buffer.allocUnsafe(3);
      const buf2 = Buffer.from(k, 'utf8');
      const buf3 = Buffer.allocUnsafe(2);
      const buf4 = Buffer.from(v, 'utf8');
      buf1.writeUInt8(PROPERTY.UserProperty);
      buf1.writeUInt16BE(buf2.length, 1);
      buf3.writeUInt16BE(buf4.length, 0);
      buffers.push(buf1, buf2, buf3, buf4);
      buffersSize += 3 + buf2.length + 2 + buf4.length;
    }
  }

  return Buffer.concat([
    genVarInt(offset + bytes.length + buffersSize),
    fixedBuf.slice(0, offset),
    Buffer.from(bytes),
    ...buffers,
  ]);
};

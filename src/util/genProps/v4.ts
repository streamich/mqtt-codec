import { PROPERTY } from '../../enums';
import {Properties} from '../../types';
import {genVarInt} from '../genVarInt/v5';

export const genProps = (props: Properties): Buffer => {
  const bytes: number[] = [];
  const buffers: Buffer[] = [];
  let buffersSize: number = 0;
  let value: any;

  // 1 byte properties
  if (props[PROPERTY.PayloadFormatIndicator] !== undefined)
    bytes.push(PROPERTY.PayloadFormatIndicator, props[PROPERTY.PayloadFormatIndicator]!);
  if (props[PROPERTY.RequestProblemInformation] !== undefined)
    bytes.push(PROPERTY.RequestProblemInformation, props[PROPERTY.RequestProblemInformation]!);
  if (props[PROPERTY.RequestResponseInformation] !== undefined)
    bytes.push(PROPERTY.RequestResponseInformation, props[PROPERTY.RequestResponseInformation]!);
  if (props[PROPERTY.MaximumQoS] !== undefined)
    bytes.push(PROPERTY.MaximumQoS, props[PROPERTY.MaximumQoS]!);
  if (props[PROPERTY.RetainAvailable] !== undefined)
    bytes.push(PROPERTY.RetainAvailable, props[PROPERTY.RetainAvailable]!);
  if (props[PROPERTY.WildcardSubscriptionAvailable] !== undefined)
    bytes.push(PROPERTY.WildcardSubscriptionAvailable, props[PROPERTY.WildcardSubscriptionAvailable]!);
  if (props[PROPERTY.SubscriptionIdentifierAvailable] !== undefined)
    bytes.push(PROPERTY.SubscriptionIdentifierAvailable, props[PROPERTY.SubscriptionIdentifierAvailable]!);
  if (props[PROPERTY.SharedSubscriptionAvailable] !== undefined)
    bytes.push(PROPERTY.SharedSubscriptionAvailable, props[PROPERTY.SharedSubscriptionAvailable]!);

  // 2 byte properties
  if (props[PROPERTY.ServerKeepAlive] !== undefined)
    bytes.push(PROPERTY.ServerKeepAlive, (props[PROPERTY.ServerKeepAlive]! & 0xFF00) >> 8, props[PROPERTY.ServerKeepAlive]! & 0xFF);
  if (props[PROPERTY.ReceiveMaximum] !== undefined)
    bytes.push(PROPERTY.ReceiveMaximum, (props[PROPERTY.ReceiveMaximum]! & 0xFF00) >> 8, props[PROPERTY.ReceiveMaximum]! & 0xFF);
  if (props[PROPERTY.TopicAliasMaximum] !== undefined)
    bytes.push(PROPERTY.TopicAliasMaximum, (props[PROPERTY.TopicAliasMaximum]! & 0xFF00) >> 8, props[PROPERTY.TopicAliasMaximum]! & 0xFF);
  if (props[PROPERTY.TopicAlias] !== undefined)
    bytes.push(PROPERTY.TopicAlias, (props[PROPERTY.TopicAlias]! & 0xFF00) >> 8, props[PROPERTY.TopicAlias]! & 0xFF);

  // 4 byte properties
  if (props[PROPERTY.MessageExpiryInterval] !== undefined)
    bytes.push(
      PROPERTY.MessageExpiryInterval,
      (props[PROPERTY.MessageExpiryInterval]! & 0xFF000000) >> 24,
      (props[PROPERTY.MessageExpiryInterval]! & 0xFF0000) >> 16,
      (props[PROPERTY.MessageExpiryInterval]! & 0xFF00) >> 8,
      props[PROPERTY.MessageExpiryInterval]! & 0xFF
    );
  if (props[PROPERTY.WillDelayInterval] !== undefined)
    bytes.push(
      PROPERTY.WillDelayInterval,
      (props[PROPERTY.WillDelayInterval]! & 0xFF000000) >> 24,
      (props[PROPERTY.WillDelayInterval]! & 0xFF0000) >> 16,
      (props[PROPERTY.WillDelayInterval]! & 0xFF00) >> 8,
      props[PROPERTY.WillDelayInterval]! & 0xFF
    );
  if (props[PROPERTY.SessionExpiryInterval] !== undefined)
    bytes.push(
      PROPERTY.SessionExpiryInterval,
      (props[PROPERTY.SessionExpiryInterval]! & 0xFF000000) >> 24,
      (props[PROPERTY.SessionExpiryInterval]! & 0xFF0000) >> 16,
      (props[PROPERTY.SessionExpiryInterval]! & 0xFF00) >> 8,
      props[PROPERTY.SessionExpiryInterval]! & 0xFF
    );
  if (props[PROPERTY.MaximumPacketSize] !== undefined)
    bytes.push(
      PROPERTY.MaximumPacketSize,
      (props[PROPERTY.MaximumPacketSize]! & 0xFF000000) >> 24,
      (props[PROPERTY.MaximumPacketSize]! & 0xFF0000) >> 16,
      (props[PROPERTY.MaximumPacketSize]! & 0xFF00) >> 8,
      props[PROPERTY.MaximumPacketSize]! & 0xFF
    );

  // Variable length integers
  value = props[PROPERTY.SubscriptionIdentifier];
  if (value !== undefined) {
    const int = genVarInt(value);
    buffersSize += 1 + int.length;
    buffers.push(Buffer.from([PROPERTY.SubscriptionIdentifier]), int);
  }

  // Binary data
  value = props[PROPERTY.CorrelationData];
  if (value) {
    const buf = Buffer.allocUnsafe(3);
    buf.writeUInt8(PROPERTY.CorrelationData);
    buf.writeUInt16BE(value.length, 1);
    buffers.push(buf, value);
    buffersSize += 3 + value.length;
  }
  value = props[PROPERTY.AuthenticationData];
  if (value) {
    const buf = Buffer.allocUnsafe(3);
    buf.writeUInt8(PROPERTY.AuthenticationData);
    buf.writeUInt16BE(value.length, 1);
    buffers.push(buf, value);
    buffersSize += 3 + buf.length;
  }

  // Strings
  value = props[PROPERTY.ContentType];
  if (value !== undefined) {
    const buf = Buffer.from('123' + value, 'utf8');
    buf.writeUInt8(PROPERTY.ContentType);
    buf.writeUInt16BE(buf.length - 3, 1);
    buffers.push(buf);
    buffersSize += buf.length;
  }
  value = props[PROPERTY.ResponseTopic];
  if (value !== undefined) {
    const buf = Buffer.from('123' + value, 'utf8');
    buf.writeUInt8(PROPERTY.ResponseTopic);
    buf.writeUInt16BE(buf.length - 3, 1);
    buffers.push(buf);
    buffersSize += buf.length;
  }
  value = props[PROPERTY.AssignedClientIdentifier];
  if (value !== undefined) {
    const buf = Buffer.from('123' + value, 'utf8');
    buf.writeUInt8(PROPERTY.AssignedClientIdentifier);
    buf.writeUInt16BE(buf.length - 3, 1);
    buffers.push(buf);
    buffersSize += buf.length;
  }
  value = props[PROPERTY.AuthenticationMethod];
  if (value !== undefined) {
    const buf = Buffer.from('123' + value, 'utf8');
    buf.writeUInt8(PROPERTY.AuthenticationMethod);
    buf.writeUInt16BE(buf.length - 3, 1);
    buffers.push(buf);
    buffersSize += buf.length;
  }
  value = props[PROPERTY.ResponseInformation];
  if (value !== undefined) {
    const buf = Buffer.from('123' + value, 'utf8');
    buf.writeUInt8(PROPERTY.ResponseInformation);
    buf.writeUInt16BE(buf.length - 3, 1);
    buffers.push(buf);
    buffersSize += buf.length;
  }
  value = props[PROPERTY.ServerReference];
  if (value !== undefined) {
    const buf = Buffer.from('123' + value, 'utf8');
    buf.writeUInt8(PROPERTY.ServerReference);
    buf.writeUInt16BE(buf.length - 3, 1);
    buffers.push(buf);
    buffersSize += buf.length;
  }
  value = props[PROPERTY.ReasonString];
  if (value !== undefined) {
    const buf = Buffer.from('123' + value, 'utf8');
    buf.writeUInt8(PROPERTY.ReasonString);
    buf.writeUInt16BE(buf.length - 3, 1);
    buffers.push(buf);
    buffersSize += buf.length;
  }

  value = props[PROPERTY.UserProperty];
  if (value) {
    for (const [k, v] of value) {
      const bufKey = Buffer.from('123' + k, 'utf8');
      const bugValue = Buffer.from('12' + v, 'utf8');
      bufKey.writeUInt8(PROPERTY.UserProperty);
      bufKey.writeUInt16BE(bufKey.length - 3, 1);
      bugValue.writeUInt16BE(bugValue.length - 2, 0);
      buffers.push(bufKey, bugValue);
      buffersSize += bufKey.length + bugValue.length;
    }
  }

  return Buffer.concat([
    genVarInt(bytes.length + buffersSize),
    Buffer.from(bytes),
    ...buffers,
  ]);
};

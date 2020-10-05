import { PROPERTY } from '../../enums';
import {Properties} from '../../types';

const objectKeys = Object.keys.bind(Object);

export const genProps = (props: Properties): Buffer => {
  // Variable length integers
  const SubscriptionIdentifier = props[PROPERTY.SubscriptionIdentifier];
  
  // Binary data
  const CorrelationData = props[PROPERTY.CorrelationData];
  const AuthenticationData = props[PROPERTY.AuthenticationData];

  const ContentType = props[PROPERTY.ContentType];
  const ResponseTopic = props[PROPERTY.ResponseTopic];
  const AssignedClientIdentifier = props[PROPERTY.AssignedClientIdentifier];
  const AuthenticationMethod = props[PROPERTY.AuthenticationMethod];
  const ResponseInformation = props[PROPERTY.ResponseInformation];
  const ServerReference = props[PROPERTY.ServerReference];
  const ReasonString = props[PROPERTY.ReasonString];

  // User properties
  const UserProperty = props[PROPERTY.UserProperty];

  let size = 0;
  const keys = objectKeys(props);

  for (const key of keys) {
    switch (Number(key)) {
      case PROPERTY.PayloadFormatIndicator:
      case PROPERTY.RequestProblemInformation:
      case PROPERTY.RequestResponseInformation:
      case PROPERTY.MaximumQoS:
      case PROPERTY.RetainAvailable:
      case PROPERTY.WildcardSubscriptionAvailable:
      case PROPERTY.SubscriptionIdentifierAvailable:
      case PROPERTY.SharedSubscriptionAvailable:
        size += 2;
        break;
      case PROPERTY.ServerKeepAlive:
      case PROPERTY.ReceiveMaximum:
      case PROPERTY.TopicAliasMaximum:
      case PROPERTY.TopicAlias:
        size += 3;
        break;
      case PROPERTY.MessageExpiryInterval:
      case PROPERTY.WillDelayInterval:
      case PROPERTY.SessionExpiryInterval:
      case PROPERTY.MaximumPacketSize:
        size += 5;
        break;
      case PROPERTY.SubscriptionIdentifier:
        if (SubscriptionIdentifier! < 128) size += 2;
        else if (SubscriptionIdentifier! < 16_384) size += 3;
        else if (SubscriptionIdentifier! < 2_097_152) size += 4;
        else size += 5;
        break;
      case PROPERTY.CorrelationData:
        size += 3 + CorrelationData!.length;
        break;
      case PROPERTY.AuthenticationData:
        size += 3 + AuthenticationData!.length;
        break;
      case PROPERTY.ContentType:
      case PROPERTY.ResponseTopic:
      case PROPERTY.AssignedClientIdentifier:
      case PROPERTY.AuthenticationMethod:
      case PROPERTY.ResponseInformation:
      case PROPERTY.ServerReference:
      case PROPERTY.ReasonString:
        size += 3 + Buffer.byteLength((props as any)[key]);
        break;
    }
  }

  // User properties
  if (UserProperty) {
    const len = UserProperty.length;
    for (let i = 0; i < len; i++)
      size += 5 + Buffer.byteLength(UserProperty[i][0]) + Buffer.byteLength(UserProperty[i][1]);
  }

  let offset: number = 0;
  let buf: Buffer;

  // Write initial properties variable length integer.
  if (size < 128) {
    offset = 1;
    buf = Buffer.allocUnsafe(size + 1);
    buf.writeUInt8(size, 0);
  } else if (size < 16_384) {
    offset = 2;
    buf = Buffer.allocUnsafe(size + 2);
    buf.writeUInt16LE(((size & 0b011111110000000) << 1) | (0b10000000 | (size & 0b01111111)), 0);
  } else if (size < 2_097_152) {
    offset = 3;
    buf = Buffer.allocUnsafe(size + 3);
    buf.writeUInt16LE(((0b100000000000000 | (size & 0b011111110000000)) << 1) | (0b10000000 | (size & 0b01111111)), 0);
    buf.writeUInt8((size >> 14) & 0b01111111, 2);
  } else {
    offset = 4;
    buf = Buffer.allocUnsafe(size + 4);
    buf.writeUInt32LE((((((size >> 21) & 0b01111111) << 8) | (0b10000000 | ((size >> 14) & 0b01111111))) << 16) |
      ((0b100000000000000 | (size & 0b011111110000000)) << 1) | (0b10000000 | (size & 0b01111111)), 0);
  }

  for (const key of keys) {
    const identifier = Number(key);
    switch (identifier) {
      case PROPERTY.PayloadFormatIndicator:
      case PROPERTY.RequestProblemInformation:
      case PROPERTY.RequestResponseInformation:
      case PROPERTY.MaximumQoS:
      case PROPERTY.RetainAvailable:
      case PROPERTY.WildcardSubscriptionAvailable:
      case PROPERTY.SubscriptionIdentifierAvailable:
      case PROPERTY.SharedSubscriptionAvailable:
        buf.writeUInt8(identifier, offset++);
        buf.writeUInt8((props as any)[key], offset++);
        break;
      case PROPERTY.ServerKeepAlive:
      case PROPERTY.ReceiveMaximum:
      case PROPERTY.TopicAliasMaximum:
      case PROPERTY.TopicAlias:
        buf.writeUInt8(identifier, offset++);
        buf.writeUInt16BE((props as any)[key], offset);
        offset += 2;
        break;
      case PROPERTY.MessageExpiryInterval:
      case PROPERTY.WillDelayInterval:
      case PROPERTY.SessionExpiryInterval:
      case PROPERTY.MaximumPacketSize:
        buf.writeUInt8(identifier, offset++);
        buf.writeUInt32BE((props as any)[key], offset);
        offset += 4;
        break;
    }
  }

  // Variable length integers
  if (SubscriptionIdentifier !== undefined) {
    buf.writeUInt8(PROPERTY.SubscriptionIdentifier, offset++);
    if (SubscriptionIdentifier < 128) {
      buf.writeUInt8(SubscriptionIdentifier, offset++);
    } else if (SubscriptionIdentifier < 16_384) {
      buf.writeUInt16LE(((SubscriptionIdentifier & 0b011111110000000) << 1) | (0b10000000 | (SubscriptionIdentifier & 0b01111111)), offset);
      offset += 2;
    } else if (SubscriptionIdentifier < 2_097_152) {
      buf.writeUInt16LE(((0b100000000000000 | (SubscriptionIdentifier & 0b011111110000000)) << 1) | (0b10000000 | (SubscriptionIdentifier & 0b01111111)), offset);
      offset += 2;
      buf.writeUInt8((SubscriptionIdentifier >> 14) & 0b01111111, offset);
      offset += 1;
    } else {
      buf.writeUInt32LE((((((SubscriptionIdentifier >> 21) & 0b01111111) << 8) | (0b10000000 | ((SubscriptionIdentifier >> 14) & 0b01111111))) << 16) |
        ((0b100000000000000 | (SubscriptionIdentifier & 0b011111110000000)) << 1) | (0b10000000 | (SubscriptionIdentifier & 0b01111111)), offset);
      offset += 4;
    }
  }

  // Binary data
  if (CorrelationData) {
    const len = CorrelationData.length;
    buf.writeUInt8(PROPERTY.CorrelationData, offset++);
    buf.writeUInt16BE(len, offset);
    offset += 2;
    CorrelationData.copy(buf, offset);
    offset += len;
  }
  if (AuthenticationData) {
    const len = AuthenticationData.length;
    buf.writeUInt8(PROPERTY.AuthenticationData, offset++);
    buf.writeUInt16BE(len, offset);
    offset += 2;
    AuthenticationData.copy(buf, offset);
    offset += len;
  }

  // Strings  
  if (ContentType !== undefined) {
    const lenContentType: number = Buffer.byteLength(ContentType);
    buf.writeUInt8(PROPERTY.ContentType, offset++);
    buf.writeUInt16BE(lenContentType, offset);
    offset += 2;
    buf.write(ContentType, offset);
    offset += lenContentType;
  }
  if (ResponseTopic !== undefined) {
    const lenResponseTopic: number = Buffer.byteLength(ResponseTopic);
    buf.writeUInt8(PROPERTY.ResponseTopic, offset++);
    buf.writeUInt16BE(lenResponseTopic, offset);
    offset += 2;
    buf.write(ResponseTopic, offset);
    offset += lenResponseTopic;
  }
  if (AssignedClientIdentifier !== undefined) {
    const lenAssignedClientIdentifier: number = Buffer.byteLength(AssignedClientIdentifier);
    buf.writeUInt8(PROPERTY.AssignedClientIdentifier, offset++);
    buf.writeUInt16BE(lenAssignedClientIdentifier, offset);
    offset += 2;
    buf.write(AssignedClientIdentifier, offset);
    offset += lenAssignedClientIdentifier;
  }
  if (AuthenticationMethod !== undefined) {
    const lenAuthenticationMethod: number = Buffer.byteLength(AuthenticationMethod);
    buf.writeUInt8(PROPERTY.AuthenticationMethod, offset++);
    buf.writeUInt16BE(lenAuthenticationMethod, offset);
    offset += 2;
    buf.write(AuthenticationMethod, offset);
    offset += lenAuthenticationMethod;
  }
  if (ResponseInformation !== undefined) {
    const lenResponseInformation: number = Buffer.byteLength(ResponseInformation);
    buf.writeUInt8(PROPERTY.ResponseInformation, offset++);
    buf.writeUInt16BE(lenResponseInformation, offset);
    offset += 2;
    buf.write(ResponseInformation, offset);
    offset += lenResponseInformation;
  }
  if (ServerReference !== undefined) {
    const lenServerReference: number = Buffer.byteLength(ServerReference);
    buf.writeUInt8(PROPERTY.ServerReference, offset++);
    buf.writeUInt16BE(lenServerReference, offset);
    offset += 2;
    buf.write(ServerReference, offset);
    offset += lenServerReference;
  }
  if (ReasonString !== undefined) {
    const lenReasonString: number = Buffer.byteLength(ReasonString);
    buf.writeUInt8(PROPERTY.ReasonString, offset++);
    buf.writeUInt16BE(lenReasonString, offset);
    offset += 2;
    buf.write(ReasonString, offset);
    offset += lenReasonString;
  }

  if (UserProperty) {
    const len = UserProperty.length;
    for (let i = 0; i < len; i++) {
      const k = UserProperty[i][0];
      const v = UserProperty[i][1];
      const kLen = Buffer.byteLength(k);
      const vLen = Buffer.byteLength(v);
      buf.writeUInt8(PROPERTY.UserProperty, offset++);
      buf.writeUInt16BE(kLen, offset);
      offset += 2;
      buf.write(k + '__' + v, offset);
      offset += kLen;
      buf.writeUInt16BE(vLen, offset);
      offset += 2 + vLen;
    }
  }

  return buf;
};

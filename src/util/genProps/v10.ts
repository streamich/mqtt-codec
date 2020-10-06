import {PROPERTY} from '../../enums';
import {Properties} from '../../types';

const byteLength = Buffer.byteLength.bind(Buffer);

export const genProps = (props: Properties): Buffer => {
  let size = 0;

  // 1 byte properties
  const PayloadFormatIndicator = props[PROPERTY.PayloadFormatIndicator];
  const RequestProblemInformation = props[PROPERTY.RequestProblemInformation];
  const RequestResponseInformation = props[PROPERTY.RequestResponseInformation];
  const MaximumQoS = props[PROPERTY.MaximumQoS];
  const RetainAvailable = props[PROPERTY.RetainAvailable];
  const WildcardSubscriptionAvailable = props[PROPERTY.WildcardSubscriptionAvailable];
  const SubscriptionIdentifierAvailable = props[PROPERTY.SubscriptionIdentifierAvailable];
  const SharedSubscriptionAvailable = props[PROPERTY.SharedSubscriptionAvailable];
  
  // 2 byte properties
  const ServerKeepAlive = props[PROPERTY.ServerKeepAlive];
  const ReceiveMaximum = props[PROPERTY.ReceiveMaximum];
  const TopicAliasMaximum = props[PROPERTY.TopicAliasMaximum];
  const TopicAlias = props[PROPERTY.TopicAlias];
  
  // 4 byte properties
  const MessageExpiryInterval = props[PROPERTY.MessageExpiryInterval];
  const WillDelayInterval = props[PROPERTY.WillDelayInterval];
  const SessionExpiryInterval = props[PROPERTY.SessionExpiryInterval];
  const MaximumPacketSize = props[PROPERTY.MaximumPacketSize];

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

  // 1 byte properties
  if (PayloadFormatIndicator !== undefined) size += 2;
  if (RequestProblemInformation !== undefined) size += 2;
  if (RequestResponseInformation !== undefined) size += 2;
  if (MaximumQoS !== undefined) size += 2;
  if (RetainAvailable !== undefined) size += 2;
  if (WildcardSubscriptionAvailable !== undefined) size += 2;
  if (SubscriptionIdentifierAvailable !== undefined) size += 2;
  if (SharedSubscriptionAvailable !== undefined) size += 2;

  // 2 byte properties
  if (ServerKeepAlive !== undefined) size += 3;
  if (ReceiveMaximum !== undefined) size += 3;
  if (TopicAliasMaximum !== undefined) size += 3;
  if (TopicAlias !== undefined) size += 3;

  // 4 byte properties
  if (MessageExpiryInterval !== undefined) size += 5;
  if (WillDelayInterval !== undefined) size += 5;
  if (SessionExpiryInterval !== undefined) size += 5;
  if (MaximumPacketSize !== undefined) size += 5;

  // Variable length integers
  if (SubscriptionIdentifier !== undefined) {
    if (SubscriptionIdentifier < 128) size += 2;
    else if (SubscriptionIdentifier < 16_384) size += 3;
    else if (SubscriptionIdentifier < 2_097_152) size += 4;
    else size += 5;
  }

  // Binary data
  if (CorrelationData) size += 1 + 2 + CorrelationData.length;
  if (AuthenticationData) size += 1 + 2 + AuthenticationData.length;

  // Strings
  let lenContentType: number = 0;
  if (ContentType !== undefined) size += 1 + 2 + (lenContentType = byteLength(ContentType));
  let lenResponseTopic: number = 0;
  if (ResponseTopic !== undefined) size += 1 + 2 + (lenResponseTopic = byteLength(ResponseTopic));
  let lenAssignedClientIdentifier: number = 0;
  if (AssignedClientIdentifier !== undefined) size += 1 + 2 + (lenAssignedClientIdentifier = byteLength(AssignedClientIdentifier));
  let lenAuthenticationMethod: number = 0;
  if (AuthenticationMethod !== undefined) size += 1 + 2 + (lenAuthenticationMethod = byteLength(AuthenticationMethod));
  let lenResponseInformation: number = 0;
  if (ResponseInformation !== undefined) size += 1 + 2 + (lenResponseInformation = byteLength(ResponseInformation));
  let lenServerReference: number = 0;
  if (ServerReference !== undefined) size += 1 + 2 + (lenServerReference = byteLength(ServerReference));
  let lenReasonString: number = 0;
  if (ReasonString !== undefined) size += 1 + 2 + (lenReasonString = byteLength(ReasonString));

  // User properties
  if (UserProperty) {
    const len = UserProperty.length;
    for (let i = 0; i < len; i += 2) {
      size += 5 + byteLength(UserProperty[i]) + byteLength(UserProperty[i + 1]);
    }
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

  const writeUInt8 = buf.writeUInt8.bind(buf);
  const writeUInt16BE = buf.writeUInt16BE.bind(buf);

  // 1 byte properties
  if (PayloadFormatIndicator !== undefined) {
    writeUInt8(PROPERTY.PayloadFormatIndicator, offset++);
    writeUInt8(PayloadFormatIndicator, offset++);
  }
  if (RequestProblemInformation !== undefined) {
    writeUInt8(PROPERTY.RequestProblemInformation, offset++);
    writeUInt8(RequestProblemInformation, offset++);
  }
  if (RequestResponseInformation !== undefined) {
    writeUInt8(PROPERTY.RequestResponseInformation, offset++);
    writeUInt8(RequestResponseInformation, offset++);
  }
  if (MaximumQoS !== undefined) {
    writeUInt8(PROPERTY.MaximumQoS, offset++);
    writeUInt8(MaximumQoS, offset++);
  }
  if (RetainAvailable !== undefined) {
    writeUInt8(PROPERTY.RetainAvailable, offset++);
    writeUInt8(RetainAvailable, offset++);
  }
  if (WildcardSubscriptionAvailable !== undefined) {
    writeUInt8(PROPERTY.WildcardSubscriptionAvailable, offset++);
    writeUInt8(WildcardSubscriptionAvailable, offset++);
  }
  if (SubscriptionIdentifierAvailable !== undefined) {
    writeUInt8(PROPERTY.SubscriptionIdentifierAvailable, offset++);
    writeUInt8(SubscriptionIdentifierAvailable, offset++);
  }
  if (SharedSubscriptionAvailable !== undefined) {
    writeUInt8(PROPERTY.SharedSubscriptionAvailable, offset++);
    writeUInt8(SharedSubscriptionAvailable, offset++);
  }

  // 2 byte properties
  if (ServerKeepAlive !== undefined) {
    writeUInt8(PROPERTY.ServerKeepAlive, offset++);
    writeUInt16BE(ServerKeepAlive, offset);
    offset += 2;
  }
  if (ReceiveMaximum !== undefined) {
    writeUInt8(PROPERTY.ReceiveMaximum, offset++);
    writeUInt16BE(ReceiveMaximum, offset);
    offset += 2;
  }
  if (TopicAliasMaximum !== undefined) {
    writeUInt8(PROPERTY.TopicAliasMaximum, offset++);
    writeUInt16BE(TopicAliasMaximum, offset);
    offset += 2;
  }
  if (TopicAlias !== undefined) {
    writeUInt8(PROPERTY.TopicAlias, offset++);
    writeUInt16BE(TopicAlias, offset);
    offset += 2;
  }

  // 4 byte properties
  if (MessageExpiryInterval !== undefined) {
    writeUInt8(PROPERTY.MessageExpiryInterval, offset++);
    buf.writeUInt32BE(MessageExpiryInterval, offset);
    offset += 4;
  }
  if (WillDelayInterval !== undefined) {
    writeUInt8(PROPERTY.WillDelayInterval, offset++);
    buf.writeUInt32BE(WillDelayInterval, offset);
    offset += 4;
  }
  if (SessionExpiryInterval !== undefined) {
    writeUInt8(PROPERTY.SessionExpiryInterval, offset++);
    buf.writeUInt32BE(SessionExpiryInterval, offset);
    offset += 4;
  }
  if (MaximumPacketSize !== undefined) {
    writeUInt8(PROPERTY.MaximumPacketSize, offset++);
    buf.writeUInt32BE(MaximumPacketSize, offset);
    offset += 4;
  }

  // Variable length integers
  if (SubscriptionIdentifier !== undefined) {
    writeUInt8(PROPERTY.SubscriptionIdentifier, offset++);
    if (SubscriptionIdentifier < 128) {
      writeUInt8(SubscriptionIdentifier, offset++);
    } else if (SubscriptionIdentifier < 16_384) {
      buf.writeUInt16LE(((SubscriptionIdentifier & 0b011111110000000) << 1) | (0b10000000 | (SubscriptionIdentifier & 0b01111111)), offset);
      offset += 2;
    } else if (SubscriptionIdentifier < 2_097_152) {
      buf.writeUInt16LE(((0b100000000000000 | (SubscriptionIdentifier & 0b011111110000000)) << 1) | (0b10000000 | (SubscriptionIdentifier & 0b01111111)), offset);
      offset += 2;
      writeUInt8((SubscriptionIdentifier >> 14) & 0b01111111, offset);
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
    writeUInt8(PROPERTY.CorrelationData, offset++);
    writeUInt16BE(len, offset);
    offset += 2;
    CorrelationData.copy(buf, offset);
    offset += len;
  }
  if (AuthenticationData) {
    const len = AuthenticationData.length;
    writeUInt8(PROPERTY.AuthenticationData, offset++);
    writeUInt16BE(len, offset);
    offset += 2;
    AuthenticationData.copy(buf, offset);
    offset += len;
  }

  // Strings
  if (ContentType !== undefined) {
    writeUInt8(PROPERTY.ContentType, offset++);
    writeUInt16BE(lenContentType, offset);
    offset += 2;
    buf.write(ContentType, offset);
    offset += lenContentType;
  }
  if (ResponseTopic !== undefined) {
    writeUInt8(PROPERTY.ResponseTopic, offset++);
    writeUInt16BE(lenResponseTopic, offset);
    offset += 2;
    buf.write(ResponseTopic, offset);
    offset += lenResponseTopic;
  }
  if (AssignedClientIdentifier !== undefined) {
    writeUInt8(PROPERTY.AssignedClientIdentifier, offset++);
    writeUInt16BE(lenAssignedClientIdentifier, offset);
    offset += 2;
    buf.write(AssignedClientIdentifier, offset);
    offset += lenAssignedClientIdentifier;
  }
  if (AuthenticationMethod !== undefined) {
    writeUInt8(PROPERTY.AuthenticationMethod, offset++);
    writeUInt16BE(lenAuthenticationMethod, offset);
    offset += 2;
    buf.write(AuthenticationMethod, offset);
    offset += lenAuthenticationMethod;
  }
  if (ResponseInformation !== undefined) {
    writeUInt8(PROPERTY.ResponseInformation, offset++);
    writeUInt16BE(lenResponseInformation, offset);
    offset += 2;
    buf.write(ResponseInformation, offset);
    offset += lenResponseInformation;
  }
  if (ServerReference !== undefined) {
    writeUInt8(PROPERTY.ServerReference, offset++);
    writeUInt16BE(lenServerReference, offset);
    offset += 2;
    buf.write(ServerReference, offset);
    offset += lenServerReference;
  }
  if (ReasonString !== undefined) {
    writeUInt8(PROPERTY.ReasonString, offset++);
    writeUInt16BE(lenReasonString, offset);
    offset += 2;
    buf.write(ReasonString, offset);
    offset += lenReasonString;
  }

  if (UserProperty) {
    const len = UserProperty.length;
    for (let i = 0; i < len; i += 2) {
      const k = UserProperty[i];
      const v = UserProperty[i + 1];
      const kLen = byteLength(k);
      const vLen = byteLength(v);
      writeUInt8(PROPERTY.UserProperty, offset++);
      writeUInt16BE(kLen, offset);
      offset += 2;
      buf.write(k + '__' + v, offset);
      offset += kLen;
      writeUInt16BE(vLen, offset);
      offset += 2 + vLen;
    }
  }

  return buf;
};

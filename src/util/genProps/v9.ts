import { PROPERTY } from '../../enums';
import {Properties} from '../../types';
import { getPropsLen } from './getPropsLen';

export const genProps = (props: Properties): Buffer => {
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

  const size = getPropsLen(props);
  const buf: Buffer = Buffer.allocUnsafe(size);
  let offset: number = 0;

  // Write initial properties variable length integer.
  if (size < 129) {
    offset = 1;
    buf.writeUInt8(size - 1, 0);
  } else if (size < 16_386) {
    offset = 2;
    const contentSize = size - 2;
    buf.writeUInt16LE(((contentSize & 0b011111110000000) << 1) | (0b10000000 | (contentSize & 0b01111111)), 0);
  } else if (size < 2_097_155) {
    offset = 3;
    const contentSize = size - 3;
    buf.writeUInt16LE(((0b100000000000000 | (contentSize & 0b011111110000000)) << 1) | (0b10000000 | (contentSize & 0b01111111)), 0);
    buf.writeUInt8((contentSize >> 14) & 0b01111111, 2);
  } else {
    offset = 4;
    const contentSize = size - 4;
    buf.writeUInt32LE((((((contentSize >> 21) & 0b01111111) << 8) | (0b10000000 | ((contentSize >> 14) & 0b01111111))) << 16) |
      ((0b100000000000000 | (contentSize & 0b011111110000000)) << 1) | (0b10000000 | (contentSize & 0b01111111)), 0);
  }

  // 1 byte properties
  if (PayloadFormatIndicator !== undefined) {
    buf.writeUInt8(PROPERTY.PayloadFormatIndicator, offset++);
    buf.writeUInt8(PayloadFormatIndicator, offset++);
  }
  if (RequestProblemInformation !== undefined) {
    buf.writeUInt8(PROPERTY.RequestProblemInformation, offset++);
    buf.writeUInt8(RequestProblemInformation, offset++);
  }
  if (RequestResponseInformation !== undefined) {
    buf.writeUInt8(PROPERTY.RequestResponseInformation, offset++);
    buf.writeUInt8(RequestResponseInformation, offset++);
  }
  if (MaximumQoS !== undefined) {
    buf.writeUInt8(PROPERTY.MaximumQoS, offset++);
    buf.writeUInt8(MaximumQoS, offset++);
  }
  if (RetainAvailable !== undefined) {
    buf.writeUInt8(PROPERTY.RetainAvailable, offset++);
    buf.writeUInt8(RetainAvailable, offset++);
  }
  if (WildcardSubscriptionAvailable !== undefined) {
    buf.writeUInt8(PROPERTY.WildcardSubscriptionAvailable, offset++);
    buf.writeUInt8(WildcardSubscriptionAvailable, offset++);
  }
  if (SubscriptionIdentifierAvailable !== undefined) {
    buf.writeUInt8(PROPERTY.SubscriptionIdentifierAvailable, offset++);
    buf.writeUInt8(SubscriptionIdentifierAvailable, offset++);
  }
  if (SharedSubscriptionAvailable !== undefined) {
    buf.writeUInt8(PROPERTY.SharedSubscriptionAvailable, offset++);
    buf.writeUInt8(SharedSubscriptionAvailable, offset++);
  }

  // 2 byte properties
  if (ServerKeepAlive !== undefined) {
    buf.writeUInt8(PROPERTY.ServerKeepAlive, offset++);
    buf.writeUInt16BE(ServerKeepAlive, offset);
    offset += 2;
  }
  if (ReceiveMaximum !== undefined) {
    buf.writeUInt8(PROPERTY.ReceiveMaximum, offset++);
    buf.writeUInt16BE(ReceiveMaximum, offset);
    offset += 2;
  }
  if (TopicAliasMaximum !== undefined) {
    buf.writeUInt8(PROPERTY.TopicAliasMaximum, offset++);
    buf.writeUInt16BE(TopicAliasMaximum, offset);
    offset += 2;
  }
  if (TopicAlias !== undefined) {
    buf.writeUInt8(PROPERTY.TopicAlias, offset++);
    buf.writeUInt16BE(TopicAlias, offset);
    offset += 2;
  }

  // 4 byte properties
  if (MessageExpiryInterval !== undefined) {
    buf.writeUInt8(PROPERTY.MessageExpiryInterval, offset++);
    buf.writeUInt32BE(MessageExpiryInterval, offset);
    offset += 4;
  }
  if (WillDelayInterval !== undefined) {
    buf.writeUInt8(PROPERTY.WillDelayInterval, offset++);
    buf.writeUInt32BE(WillDelayInterval, offset);
    offset += 4;
  }
  if (SessionExpiryInterval !== undefined) {
    buf.writeUInt8(PROPERTY.SessionExpiryInterval, offset++);
    buf.writeUInt32BE(SessionExpiryInterval, offset);
    offset += 4;
  }
  if (MaximumPacketSize !== undefined) {
    buf.writeUInt8(PROPERTY.MaximumPacketSize, offset++);
    buf.writeUInt32BE(MaximumPacketSize, offset);
    offset += 4;
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
    const lenContentType = Buffer.byteLength(ContentType);
    buf.writeUInt8(PROPERTY.ContentType, offset++);
    buf.writeUInt16BE(lenContentType, offset);
    offset += 2;
    buf.write(ContentType, offset);
    offset += lenContentType;
  }
  if (ResponseTopic !== undefined) {
    const lenResponseTopic = Buffer.byteLength(ResponseTopic);
    buf.writeUInt8(PROPERTY.ResponseTopic, offset++);
    buf.writeUInt16BE(lenResponseTopic, offset);
    offset += 2;
    buf.write(ResponseTopic, offset);
    offset += lenResponseTopic;
  }
  if (AssignedClientIdentifier !== undefined) {
    const lenAssignedClientIdentifier = Buffer.byteLength(AssignedClientIdentifier);
    buf.writeUInt8(PROPERTY.AssignedClientIdentifier, offset++);
    buf.writeUInt16BE(lenAssignedClientIdentifier, offset);
    offset += 2;
    buf.write(AssignedClientIdentifier, offset);
    offset += lenAssignedClientIdentifier;
  }
  if (AuthenticationMethod !== undefined) {
    const lenAuthenticationMethod = Buffer.byteLength(AuthenticationMethod);
    buf.writeUInt8(PROPERTY.AuthenticationMethod, offset++);
    buf.writeUInt16BE(lenAuthenticationMethod, offset);
    offset += 2;
    buf.write(AuthenticationMethod, offset);
    offset += lenAuthenticationMethod;
  }
  if (ResponseInformation !== undefined) {
    const lenResponseInformation = Buffer.byteLength(ResponseInformation);
    buf.writeUInt8(PROPERTY.ResponseInformation, offset++);
    buf.writeUInt16BE(lenResponseInformation, offset);
    offset += 2;
    buf.write(ResponseInformation, offset);
    offset += lenResponseInformation;
  }
  if (ServerReference !== undefined) {
    const lenServerReference = Buffer.byteLength(ServerReference);
    buf.writeUInt8(PROPERTY.ServerReference, offset++);
    buf.writeUInt16BE(lenServerReference, offset);
    offset += 2;
    buf.write(ServerReference, offset);
    offset += lenServerReference;
  }
  if (ReasonString !== undefined) {
    const lenReasonString = Buffer.byteLength(ReasonString);
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

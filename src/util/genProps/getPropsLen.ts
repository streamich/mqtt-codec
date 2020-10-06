import {PROPERTY} from '../../enums';
import {Properties} from '../../types';

const byteLength = Buffer.byteLength.bind(Buffer);

export const getPropsLen = (props: Properties): number => {
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
  if (CorrelationData) size += 3 + CorrelationData.length;
  if (AuthenticationData) size += 3 + AuthenticationData.length;

  // Strings
  if (ContentType !== undefined) size += 3 + byteLength(ContentType);
  if (ResponseTopic !== undefined) size += 3 + byteLength(ResponseTopic);
  if (AssignedClientIdentifier !== undefined) size += 3 + byteLength(AssignedClientIdentifier);
  if (AuthenticationMethod !== undefined) size += 3 + byteLength(AuthenticationMethod);
  if (ResponseInformation !== undefined) size += 3 + byteLength(ResponseInformation);
  if (ServerReference !== undefined) size += 3 + byteLength(ServerReference);
  if (ReasonString !== undefined) size += 3 + byteLength(ReasonString);

  // User properties
  if (UserProperty) {
    const len = UserProperty.length;
    for (let i = 0; i < len; i++) {
      const tuple = UserProperty[i];
      size += 5 + byteLength(tuple[0]) + byteLength(tuple[1]);
    }
  }

  const varIntSize = size < 128 ? 1 : size < 16_384 ? 2 : size < 2_097_152 ? 3 : 4;

  return varIntSize + size;
};

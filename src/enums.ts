export const enum PACKET_TYPE {
  RESERVED = 0,
  CONNECT = 1,
  CONNACK = 2,
  PUBLISH = 3,
  PUBACK = 4,
  PUBREC = 5,
  PUBREL = 6,
  PUBCOMP = 7,
  SUBSCRIBE = 8,
  SUBACK = 9,
  UNSUBSCRIBE = 10,
  UNSUBACK = 11,
  PINGREQ = 12,
  PINGRESP = 13,
  DISCONNECT = 14,
  AUTH = 15,
}

export const enum ERROR {
  MALFORMED_PACKET = 0x81, // Malformed Packet
  PROTOCOL_ERROR = 0x82, // Protocol Error
  RECEIVE_MAX_EXCEEDED = 0x93, // Receive Maximum exceeded
  PACKET_TOO_LARGE = 0x95, // Packet too large
  RETAIN_NOT_SUPPORTED = 0x9a, // Retain not supported
  QOS_NOT_SUPPORTED = 0x9b, // QoS not supported
  SHARED_SUB_NOT_SUPPORTED = 0x9e, // Shared Subscriptions not supported
  SUB_IDS_NOT_SUPPORTED = 0xa1, // Subscription Identifiers not supported
  WILDCARD_SUBS_NOT_SUPPORTED = 0xa2, // Wildcard Subscriptions not supported
}

export const enum PROPERTY {
  PayloadFormatIndicator = 1,
  MessageExpiryInterval = 2,
  ContentType = 3,
  ResponseTopic = 8,
  CorrelationData = 9,
  SubscriptionIdentifier = 11,
  SessionExpiryInterval = 17,
  AssignedClientIdentifier = 18,
  ServerKeepAlive = 19,
  AuthenticationMethod = 21,
  AuthenticationData = 22,
  RequestProblemInformation = 23,
  WillDelayInterval = 24,
  RequestResponseInformation = 25,
  ResponseInformation = 26,
  ServerReference = 28,
  ReasonString = 31,
  ReceiveMaximum = 33,
  TopicAliasMaximum = 34,
  TopicAlias = 35,
  MaximumQoS = 36,
  RetainAvailable = 37,
  UserProperty = 38,
  MaximumPacketSize = 39,
  WildcardSubscriptionAvailable = 40,
  SubscriptionIdentifierAvailable = 41,
  SharedSubscriptionAvailable = 42,
}

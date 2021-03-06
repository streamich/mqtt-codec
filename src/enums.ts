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

export const enum REASON {
  Success = 0x00,
  NormalDisconnection = 0x00,
  GrantedQoS0 = 0x00,
  GrantedQoS1 = 0x01,
  GrantedQoS2 = 0x02,
  DisconnectWithWillMessage = 0x04,
  NoMatchingSubscribers = 0x10,
  NoSubscriptionExisted = 0x11,
  ContinueAuthentication = 0x18,
  ReAuthenticate = 0x19,
  UnspecifiedError = 0x80,
  MalformedPacket = 0x81,
  ProtocolError = 0x82,
  ImplementationSpecificError = 0x83,
  UnsupportedProtocolVersion = 0x84,
  ClientIdentifierNotValid = 0x85,
  BadUserNameOrPassword = 0x86,
  NotAuthorized = 0x87,
  ServerUnavailable = 0x88,
  ServerBusy = 0x89,
  Banned = 0x8A,
  ServerShuttingDown = 0x8B,
  BadAuthenticationMethod = 0x8C,
  KeepAliveTimeout = 0x8D,
  SessionTakenOver = 0x8E,
  TopicFilterInvalid = 0x8F,
  TopicNameInvalid = 0x90,
  PacketIdentifierInUse = 0x91,
  PacketIdentifierNotFound = 0x92,
  ReceiveMaximumExceeded = 0x93,
  TopicAliasInvalid = 0x94,
  PacketTooLarge = 0x95,
  MessageRateTooHigh = 0x96,
  QuotaExceeded = 0x97,
  AdministrativeAction = 0x98,
  PayloadFormatInvalid = 0x99,
  RetainNotSupported = 0x9A,
  QoSNotSupported = 0x9B,
  UseAnotherServer = 0x9C,
  ServerMoved = 0x9D,
  SharedSubscriptionsNotSupported = 0x9E,
  ConnectionRateExceeded = 0x9F,
  MaximumConnectTime = 0xA0,
  SubscriptionIdentifiersNotSupported = 0xA1,
  WildcardSubscriptionsNotSupported = 0xA2,
}

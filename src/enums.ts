export const enum DECODER_STATE {
  HEADER = 0,
  DATA = 1,
}

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
  RETAIN_NOT_SUPPORTED = 0x9A, // Retain not supported
  QOS_NOT_SUPPORTED = 0x9B, // QoS not supported
  SHARED_SUB_NOT_SUPPORTED = 0x9E, // Shared Subscriptions not supported
  SUB_IDS_NOT_SUPPORTED = 0xA1, // Subscription Identifiers not supported
  WILDCARD_SUBS_NOT_SUPPORTED = 0xA2, // Wildcard Subscriptions not supported
}

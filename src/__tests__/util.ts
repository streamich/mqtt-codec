import { PROPERTY } from "../enums";
import { Properties } from "../types";

// prettier-ignore
export const connect311 = Buffer.from([0x10, 0x23, 0x00, 0x04, 0x4d, 0x51, 0x54, 0x54, 0x04, 0x02, 0x00, 0x3c, 0x00, 0x17, 0x6d, 0x6f, 0x73, 0x71, 0x2d, 0x46, 0x64, 0x78, 0x35, 0x6d, 0x34, 0x67, 0x58, 0x58, 0x79, 0x4f, 0x66, 0x39, 0x6c, 0x75, 0x6b, 0x67, 0x69]);
// prettier-ignore
export const connect = Buffer.from([0x10, 0x10, 0x00, 0x04, 0x4d, 0x51, 0x54, 0x54, 0x05, 0x02, 0x00, 0x3c, 0x03, 0x21, 0x00, 0x14, 0x00, 0x00]);
// prettier-ignore
export const connectWithClientId = Buffer.from([0x10, 0x13, 0x00, 0x04, 0x4d, 0x51, 0x54, 0x54, 0x05, 0x02, 0x00, 0x3c, 0x03, 0x21, 0x00, 0x14, 0x00, 0x03, 0x61, 0x62, 0x63]);
// prettier-ignore
export const connectAck311 = Buffer.from([0x20, 0x02, 0x00, 0x00]);
// prettier-ignore
export const connectAck = Buffer.from([0x20, 0x32, 0x00, 0x01, 0x2f, 0x22, 0x00, 0x0a, 0x12, 0x00, 0x29, 0x61, 0x75, 0x74, 0x6f, 0x2d, 0x41, 0x36, 0x38, 0x35, 0x42, 0x41, 0x43, 0x30, 0x2d, 0x37, 0x31, 0x38, 0x32, 0x2d, 0x45, 0x31, 0x36, 0x36, 0x2d, 0x32, 0x34, 0x32, 0x41, 0x2d, 0x33, 0x46, 0x44, 0x38, 0x33, 0x35, 0x38, 0x43, 0x30, 0x33, 0x43, 0x38]);
// prettier-ignore
export const subscribe = Buffer.from([0x82, 0x06, 0x00, 0x01, 0x00, 0x01, 0x23, 0x00]);
// prettier-ignore
export const subscribeAck = Buffer.from([0x90, 0x03, 0x00, 0x01, 0x00]);
// prettier-ignore
export const disconnect = Buffer.from([0x1c, 0xb0, 0x44, 0x94, 0xd8, 0xc0, 0x38, 0xf9, 0xd3, 0x96, 0x21, 0x14, 0x86, 0xdd, 0x60, 0x21, 0x42, 0x71, 0x00, 0x22, 0x06, 0x40, 0x2a, 0x02, 0x12, 0x0b, 0xc3, 0xc7, 0x94, 0xe0, 0xd8, 0xe2, 0x18, 0x15, 0xbc, 0xe6, 0xf2, 0xd9, 0x20, 0x01, 0x41, 0xd0, 0x00, 0x0a, 0xfe, 0xd0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0xf2, 0x75, 0x07, 0x5b, 0xc5, 0x94, 0x83, 0xc6, 0x7a, 0x0e, 0xdf, 0x70, 0x80, 0x18, 0x08, 0x00, 0x8d, 0xd9, 0x00, 0x00, 0x01, 0x01, 0x08, 0x0a, 0x35, 0x95, 0x49, 0xec, 0x75, 0xb0, 0xd8, 0xe0, 0xe0, 0x00]);
// prettier-ignore
export const publish3111 = Buffer.from([0x31, 0x2f, 0x00, 0x1a, 0x7a, 0x69, 0x62, 0x65, 0x6c, 0x33, 0x32, 0x2f, 0x31, 0x38, 0x66, 0x65, 0x33, 0x34, 0x66, 0x31, 0x64, 0x36, 0x38, 0x65, 0x2f, 0x24, 0x6e, 0x61, 0x6d, 0x65, 0x5a, 0x69, 0x62, 0x65, 0x6c, 0x33, 0x32, 0x20, 0x47, 0x61, 0x72, 0x61, 0x67, 0x65, 0x20, 0x44, 0x6f, 0x6f, 0x72]);
// prettier-ignore
export const publish2 = Buffer.from([0x31, 0x2f, 0x00, 0x1a, 0x7a, 0x69, 0x62, 0x65, 0x6c, 0x33, 0x32, 0x2f, 0x31, 0x38, 0x66, 0x65, 0x33, 0x34, 0x66, 0x31, 0x64, 0x36, 0x38, 0x65, 0x2f, 0x24, 0x6e, 0x61, 0x6d, 0x65, 0x5a, 0x69, 0x62, 0x65, 0x6c, 0x33, 0x32, 0x20, 0x47, 0x61, 0x72, 0x61, 0x67, 0x65, 0x20, 0x44, 0x6f, 0x6f, 0x72, 0x31, 0x2b, 0x00, 0x1d, 0x7a, 0x69, 0x62, 0x65, 0x6c, 0x33, 0x32, 0x2f, 0x31, 0x38, 0x66, 0x65, 0x33, 0x34, 0x66, 0x31, 0x64, 0x36, 0x38, 0x65, 0x2f, 0x24, 0x6c, 0x6f, 0x63, 0x61, 0x6c, 0x69, 0x70, 0x31, 0x39, 0x32, 0x2e, 0x31, 0x36, 0x38, 0x2e, 0x31, 0x2e, 0x31, 0x32, 0x31, 0x28, 0x00, 0x24, 0x7a, 0x69, 0x62, 0x65, 0x6c, 0x33, 0x32, 0x2f, 0x31, 0x38, 0x66, 0x65, 0x33, 0x34, 0x66, 0x31, 0x64, 0x36, 0x38, 0x65, 0x2f, 0x24, 0x73, 0x74, 0x61, 0x74, 0x73, 0x2f, 0x69, 0x6e, 0x74, 0x65, 0x72, 0x76, 0x61, 0x6c, 0x36, 0x30]);

export const allProps: Properties = {
  [PROPERTY.PayloadFormatIndicator]: 0,
  [PROPERTY.MessageExpiryInterval]: 1,
  [PROPERTY.ContentType]: 'a',
  [PROPERTY.ResponseTopic]: 'b',
  [PROPERTY.CorrelationData]: Buffer.from([1]),
  [PROPERTY.SubscriptionIdentifier]: 3,
  [PROPERTY.SessionExpiryInterval]: 4,
  [PROPERTY.AssignedClientIdentifier]: 'c',
  [PROPERTY.ServerKeepAlive]: 5,
  [PROPERTY.AuthenticationMethod]: 'd',
  [PROPERTY.AuthenticationData]: Buffer.from([2]),
  [PROPERTY.RequestProblemInformation]: 6,
  [PROPERTY.WillDelayInterval]: 7,
  [PROPERTY.RequestResponseInformation]: 8,
  [PROPERTY.ResponseInformation]: 'e',
  [PROPERTY.ServerReference]: 'f',
  [PROPERTY.ReasonString]: 'g',
  [PROPERTY.ReceiveMaximum]: 9,
  [PROPERTY.TopicAliasMaximum]: 10,
  [PROPERTY.TopicAlias]: 11,
  [PROPERTY.MaximumQoS]: 12,
  [PROPERTY.RetainAvailable]: 13,
  [PROPERTY.UserProperty]: ['h', 'i'],
  [PROPERTY.MaximumPacketSize]: 14,
  [PROPERTY.WildcardSubscriptionAvailable]: 15,
  [PROPERTY.SubscriptionIdentifierAvailable]: 16,
  [PROPERTY.SharedSubscriptionAvailable]: 17,
}

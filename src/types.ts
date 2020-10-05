import {PROPERTY} from './enums';

export type QoS = 0 | 1 | 2;

export interface Properties {
  [PROPERTY.PayloadFormatIndicator]?: number;
  [PROPERTY.MessageExpiryInterval]?: number;
  [PROPERTY.ContentType]?: string;
  [PROPERTY.ResponseTopic]?: string;
  [PROPERTY.CorrelationData]?: Buffer;
  [PROPERTY.SubscriptionIdentifier]?: number;
  [PROPERTY.SessionExpiryInterval]?: number;
  [PROPERTY.AssignedClientIdentifier]?: string;
  [PROPERTY.ServerKeepAlive]?: number;
  [PROPERTY.AuthenticationMethod]?: string;
  [PROPERTY.AuthenticationData]?: Buffer;
  [PROPERTY.RequestProblemInformation]?: number;
  [PROPERTY.WillDelayInterval]?: number;
  [PROPERTY.RequestResponseInformation]?: number;
  [PROPERTY.ResponseInformation]?: string;
  [PROPERTY.ServerReference]?: string;
  [PROPERTY.ReasonString]?: string;
  [PROPERTY.ReceiveMaximum]?: number;
  [PROPERTY.TopicAliasMaximum]?: number;
  [PROPERTY.TopicAlias]?: number;
  [PROPERTY.MaximumQoS]?: number;
  [PROPERTY.RetainAvailable]?: number;
  [PROPERTY.UserProperty]?: [name: string, value: string][];
  [PROPERTY.MaximumPacketSize]?: number;
  [PROPERTY.WildcardSubscriptionAvailable]?: number;
  [PROPERTY.SubscriptionIdentifierAvailable]?: number;
  [PROPERTY.SharedSubscriptionAvailable]?: number;
}

export interface BufferLike {
  length: number;
  readUInt8(offset: number): number;
  readUInt16BE(offset: number): number;
  readUInt32BE(offset: number): number;
  slice(start: number, end: number): Buffer;
}

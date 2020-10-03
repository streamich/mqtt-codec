import { PROPERTY } from './enums';

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
  [PROPERTY.UserProperty]?: Record<string, undefined | string>;
  [PROPERTY.MaximumPacketSize]?: number;
  [PROPERTY.WildcardSubscriptionAvailable]?: number;
  [PROPERTY.SubscriptionIdentifierAvailable]?: number;
  [PROPERTY.SharedSubscriptionAvailable]?: number;
}

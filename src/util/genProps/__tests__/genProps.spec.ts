import {genProps as v1} from '../v1';
import {genProps as v2} from '../v2';
import {genProps as v3} from '../v3';
import {genProps as v4} from '../v4';
import {genProps as v5} from '../v5';
import {genProps as v6} from '../v6';
import {genProps as v7} from '../v7';
import {genProps as v8} from '../v8';
import {genProps as v9} from '../v9';
import {genProps as v10} from '../v10';
import {genProps as v11} from '../v11';
import {parseProps} from '../../parse';
import {PROPERTY} from '../../../enums';

const generators = [v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11];

for (let i = 0; i < generators.length; i++) {
  const genProps = generators[i];
  describe(`genProps v${i + 1}`, () => {
    test('a single one byte property', () => {
      const buf = genProps({
        [PROPERTY.PayloadFormatIndicator]: 0,
      });
      const props = parseProps(buf, 0)[0];
      expect(props).toEqual({
        [PROPERTY.PayloadFormatIndicator]: 0,
      });
    });

    test('one byte properties', () => {
      const buf = genProps({
        [PROPERTY.PayloadFormatIndicator]: 1,
        [PROPERTY.RequestProblemInformation]: 2,
        [PROPERTY.RequestResponseInformation]: 3,
        [PROPERTY.MaximumQoS]: 4,
        [PROPERTY.RetainAvailable]: 5,
        [PROPERTY.WildcardSubscriptionAvailable]: 6,
        [PROPERTY.SubscriptionIdentifierAvailable]: 7,
        [PROPERTY.SharedSubscriptionAvailable]: 8,
      });
      const props = parseProps(buf, 0)[0];
      expect(props).toEqual({
        [PROPERTY.PayloadFormatIndicator]: 1,
        [PROPERTY.RequestProblemInformation]: 2,
        [PROPERTY.RequestResponseInformation]: 3,
        [PROPERTY.MaximumQoS]: 4,
        [PROPERTY.RetainAvailable]: 5,
        [PROPERTY.WildcardSubscriptionAvailable]: 6,
        [PROPERTY.SubscriptionIdentifierAvailable]: 7,
        [PROPERTY.SharedSubscriptionAvailable]: 8,
      });
    });

    test('two byte properties', () => {
      const buf = genProps({
        [PROPERTY.ServerKeepAlive]: 301,
        [PROPERTY.ReceiveMaximum]: 302,
        [PROPERTY.TopicAliasMaximum]: 303,
        [PROPERTY.TopicAlias]: 304,
      });
      const props = parseProps(buf, 0)[0];
      expect(props).toEqual({
        [PROPERTY.ServerKeepAlive]: 301,
        [PROPERTY.ReceiveMaximum]: 302,
        [PROPERTY.TopicAliasMaximum]: 303,
        [PROPERTY.TopicAlias]: 304,
      });
    });

    test('one and two byte property mix', () => {
      const buf = genProps({
        [PROPERTY.ServerKeepAlive]: 301,
        [PROPERTY.SharedSubscriptionAvailable]: 8,
      });
      const props = parseProps(buf, 0)[0];
      expect(props).toEqual({
        [PROPERTY.ServerKeepAlive]: 301,
        [PROPERTY.SharedSubscriptionAvailable]: 8,
      });
    });

    test('a single 4 byte property', () => {
      const buf = genProps({
        [PROPERTY.MessageExpiryInterval]: 34 * 0xffffff,
      });
      expect(buf.length).toBe(6);
      const props = parseProps(buf, 0)[0];
      expect(props).toEqual({
        [PROPERTY.MessageExpiryInterval]: 34 * 0xffffff,
      });
    });

    test('4 byte properties', () => {
      const buf = genProps({
        [PROPERTY.MessageExpiryInterval]: 1,
        [PROPERTY.WillDelayInterval]: 323,
        [PROPERTY.SessionExpiryInterval]: 323 * 255,
        [PROPERTY.MaximumPacketSize]: 2_000_000_000,
      });
      const props = parseProps(buf, 0)[0];
      expect(props).toEqual({
        [PROPERTY.MessageExpiryInterval]: 1,
        [PROPERTY.WillDelayInterval]: 323,
        [PROPERTY.SessionExpiryInterval]: 323 * 255,
        [PROPERTY.MaximumPacketSize]: 2_000_000_000,
      });
    });

    test('SubscriptionIdentifier with small value', () => {
      const buf = genProps({
        [PROPERTY.SubscriptionIdentifier]: 1,
      });
      const props = parseProps(buf, 0)[0];
      expect(buf.length).toBe(1 + 1 + 1);
      expect(props).toEqual({
        [PROPERTY.SubscriptionIdentifier]: 1,
      });
    });

    test('SubscriptionIdentifier with medium value', () => {
      const buf = genProps({
        [PROPERTY.SubscriptionIdentifier]: 333,
      });
      const props = parseProps(buf, 0)[0];
      expect(props).toEqual({
        [PROPERTY.SubscriptionIdentifier]: 333,
      });
    });

    test('SubscriptionIdentifier with large value', () => {
      const buf = genProps({
        [PROPERTY.SubscriptionIdentifier]: 2e6,
      });
      const props = parseProps(buf, 0)[0];
      expect(props).toEqual({
        [PROPERTY.SubscriptionIdentifier]: 2e6,
      });
    });

    test('SubscriptionIdentifier with very large value', () => {
      const buf = genProps({
        [PROPERTY.SubscriptionIdentifier]: 5e6,
      });
      const props = parseProps(buf, 0)[0];
      expect(props).toEqual({
        [PROPERTY.SubscriptionIdentifier]: 5e6,
      });
    });

    test('a single binary field', () => {
      const buf = genProps({
        [PROPERTY.CorrelationData]: Buffer.from([0]),
      });
      expect(buf.length).toBe(1 + 1 + 2 + 1);
      const props = parseProps(buf, 0)[0];
      expect(props).toEqual({
        [PROPERTY.CorrelationData]: Buffer.from([0]),
      });
    });

    test('two binary fields', () => {
      const buf = genProps({
        [PROPERTY.CorrelationData]: Buffer.from([0]),
        [PROPERTY.AuthenticationData]: Buffer.from([1, 2, 3]),
      });
      const props = parseProps(buf, 0)[0];
      expect(props).toEqual({
        [PROPERTY.CorrelationData]: Buffer.from([0]),
        [PROPERTY.AuthenticationData]: Buffer.from([1, 2, 3]),
      });
    });

    test('can encode ContentType', () => {
      const buf = genProps({
        [PROPERTY.ContentType]: 'application/json',
      });
      const props = parseProps(buf, 0)[0];
      expect(props).toEqual({
        [PROPERTY.ContentType]: 'application/json',
      });
    });

    test('can encode emojis', () => {
      const buf = genProps({
        [PROPERTY.ContentType]: '👍',
      });
      const props = parseProps(buf, 0)[0];
      expect(props).toEqual({
        [PROPERTY.ContentType]: '👍',
      });
    });

    test('many string properties', () => {
      const buf = genProps({
        [PROPERTY.ContentType]: '👍',
        [PROPERTY.ResponseTopic]: '/topic/+/#',
        [PROPERTY.AssignedClientIdentifier]: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        [PROPERTY.AuthenticationMethod]: 'jwt',
        [PROPERTY.ResponseInformation]: 'Not Found',
        [PROPERTY.ServerReference]: 'Cloud Flare',
        [PROPERTY.ReasonString]: 'Unknown',
      });
      const props = parseProps(buf, 0)[0];
      expect(props).toEqual({
        [PROPERTY.ContentType]: '👍',
        [PROPERTY.ResponseTopic]: '/topic/+/#',
        [PROPERTY.AssignedClientIdentifier]: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        [PROPERTY.AuthenticationMethod]: 'jwt',
        [PROPERTY.ResponseInformation]: 'Not Found',
        [PROPERTY.ServerReference]: 'Cloud Flare',
        [PROPERTY.ReasonString]: 'Unknown',
      });
    });

    test('can encode user property', () => {
      const buf = genProps({
        [PROPERTY.UserProperty]: [
          ['X-Forward-Ip', '127.0.0.1'],
        ],
      });
      const props = parseProps(buf, 0)[0];
      expect(props).toEqual({
        [PROPERTY.UserProperty]: [
          ['X-Forward-Ip', '127.0.0.1'],
        ],
      });
    });

    test('can have multiple user properties', () => {
      const buf = genProps({
        [PROPERTY.UserProperty]: [
          ['1', 'a'],
          ['2', 'b'],
          ['3', 'c'],
        ],
      });
      const props = parseProps(buf, 0)[0];
      expect(props).toEqual({
        [PROPERTY.UserProperty]: [
          ['1', 'a'],
          ['2', 'b'],
          ['3', 'c'],
        ],
      });
    });

    test('can set same property multiple times', () => {
      const buf = genProps({
        [PROPERTY.UserProperty]: [
          ['key', 'value-1'],
          ['key', 'value-2'],
          ['key', 'value-3'],
        ],
      });
      const props = parseProps(buf, 0)[0];
      expect(props).toEqual({
        [PROPERTY.UserProperty]: [
          ['key', 'value-1'],
          ['key', 'value-2'],
          ['key', 'value-3'],
        ],
      });
    });

    test('one property from each type', () => {
      const buf = genProps({
        [PROPERTY.RetainAvailable]: 100,
        [PROPERTY.ReceiveMaximum]: 20000,
        [PROPERTY.MessageExpiryInterval]: 120,
        [PROPERTY.SubscriptionIdentifier]: 245555,
        [PROPERTY.CorrelationData]: Buffer.from('xcxcxcxc-xcxc-xcxc-xcxc-xcxcxcxcxcxc', 'utf8'),
        [PROPERTY.ResponseTopic]: 'europe/germany/munich/sensors/temperature/room-32/termostats/#',
        [PROPERTY.UserProperty]: [
          ['Authorization', '=LAIJGORlkJMA9833LK2-LFDl:ADF83-03239234LKFJLDSLSD'],
          ['Ip-Address', '0.0.0.0'],
          ['Cache', 'no-cache'],
        ],
      });
      const props = parseProps(buf, 0)[0];
      expect(props).toEqual({
        [PROPERTY.RetainAvailable]: 100,
        [PROPERTY.ReceiveMaximum]: 20000,
        [PROPERTY.MessageExpiryInterval]: 120,
        [PROPERTY.SubscriptionIdentifier]: 245555,
        [PROPERTY.CorrelationData]: Buffer.from('xcxcxcxc-xcxc-xcxc-xcxc-xcxcxcxcxcxc', 'utf8'),
        [PROPERTY.ResponseTopic]: 'europe/germany/munich/sensors/temperature/room-32/termostats/#',
        [PROPERTY.UserProperty]: [
          ['Authorization', '=LAIJGORlkJMA9833LK2-LFDl:ADF83-03239234LKFJLDSLSD'],
          ['Ip-Address', '0.0.0.0'],
          ['Cache', 'no-cache'],
        ],
      });
    });

    test('hard-coded keys', () => {
      const buf = genProps({
        '2': 120, // MessageExpiryInterval
        '8': 'europe/germany/munich/sensors/temperature/room-32/termostats/#', // ResponseTopic
        '9': Buffer.from('xcxcxcxc-xcxc-xcxc-xcxc-xcxcxcxcxcxc', 'utf8'), // CorrelationData
        '11': 245555, // SubscriptionIdentifier
        '33': 20000, // ReceiveMaximum
        '37': 100, // RetainAvailable
        '38': [ // UserProperty
          [ 'Authorization', '=LAIJGORlkJMA9833LK2-LFDl:ADF83-03239234LKFJLDSLSD' ],
          [ 'Ip-Address', '0.0.0.0' ],
          [ 'Cache', 'no-cache' ],
        ],
      });
      const props = parseProps(buf, 0)[0];
      expect(props).toEqual({
        [PROPERTY.RetainAvailable]: 100,
        [PROPERTY.ReceiveMaximum]: 20000,
        [PROPERTY.MessageExpiryInterval]: 120,
        [PROPERTY.SubscriptionIdentifier]: 245555,
        [PROPERTY.CorrelationData]: Buffer.from('xcxcxcxc-xcxc-xcxc-xcxc-xcxcxcxcxcxc', 'utf8'),
        [PROPERTY.ResponseTopic]: 'europe/germany/munich/sensors/temperature/room-32/termostats/#',
        [PROPERTY.UserProperty]: [
          ['Authorization', '=LAIJGORlkJMA9833LK2-LFDl:ADF83-03239234LKFJLDSLSD'],
          ['Ip-Address', '0.0.0.0'],
          ['Cache', 'no-cache'],
        ],
      });
    });
  });
}

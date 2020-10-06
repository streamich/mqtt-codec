import {MqttDecoder} from '../MqttDecoder';
import {connect, connectAck, connectWithClientId, publish3111} from './util';
import {ERROR, PACKET_TYPE, PROPERTY} from '../enums';
import {PacketConnect} from '../packets/connect';
import {PacketConnack} from '../packets/connack';
import {PacketPublish} from '../packets/publish';
import {PacketPuback} from '../packets/puback';
import {PacketPubrec} from '../packets/pubrec';
import {PacketSubscribe} from '../packets/subscribe';
import {PacketSuback} from '../packets/suback';
import {PacketUnsubscribe} from '../packets/unsubscribe';
import {PacketUnsuback} from '../packets/unsuback';
import {PacketPingreq} from '../packets/pingreq';
import {PacketPubcomp} from '../packets/pubcomp';
import {PacketPubrel} from '../packets/pubrel';
import {PacketPingresp} from '../packets/pingresp';
import {PacketDisconnect} from '../packets/disconnect';
import {PacketAuth} from '../packets/auth';

it('can instantiate', () => {
  const decoder = new MqttDecoder();
});

it('throws on invalid command', () => {
  const decoder = new MqttDecoder();
  decoder.push(Buffer.from([0, 1, 0]));
  let error;
  try {
    decoder.parse();
  } catch (err) { error = err; }
  expect(error).toBe(ERROR.MALFORMED_PACKET);
});

it('throws on invalid CONNECT packet', () => {
  const decoder = new MqttDecoder();
  decoder.push(Buffer.from([
    16, 9,
    0, 6,
    77, 81, 73, 115, 100, 112,
    3
  ]));
  let error;
  try {
    decoder.parse();
  } catch (err) { error = err; }
  expect(error).toBe(ERROR.MALFORMED_PACKET);
});

it('throws on invalid Protocol ID', () => {
  const decoder = new MqttDecoder();
  decoder.push(Buffer.from([
    16, 8, // Fixed header
    0, 15, // string length 15 --> 15 > 8 --> error!
    77, 81, 73, 115, 100, 112,
    77, 81, 73, 115, 100, 112,
    77, 81, 73, 115, 100, 112,
    77, 81, 73, 115, 100, 112,
    77, 81, 73, 115, 100, 112,
    77, 81, 73, 115, 100, 112,
    77, 81, 73, 115, 100, 112,
    77, 81, 73, 115, 100, 112
  ]));
  let error;
  try {
    decoder.parse();
  } catch (err) { error = err; }
  expect(error).toBe(ERROR.MALFORMED_PACKET);
});

it('throws on unknown property', () => {
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(Buffer.from([
    61, 60, // Header
    0, 4, // Topic length
    116, 101, 115, 116, // Topic (test)
    0, 10, // Message ID
    47, // properties length
    126, 1, // unknown property
    2, 0, 0, 16, 225, // message expiry interval
    35, 0, 100, // topicAlias
    8, 0, 5, 116, 111, 112, 105, 99, // response topic
    9, 0, 4, 1, 2, 3, 4, // correlationData
    38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
    11, 120, // subscriptionIdentifier
    3, 0, 4, 116, 101, 115, 116, // content type
    116, 101, 115, 116 // Payload (test)
  ]));
  let error;
  try {
    decoder.parse();
  } catch (err) { error = err; }
  expect(error).toBe(ERROR.MALFORMED_PACKET);
});

describe('CONNECT', () => {
  it('can parse CONNECT packet fixed header', () => {
    const decoder = new MqttDecoder();
    decoder.push(connect);
    const packet = decoder.parse()! as PacketConnect;
    expect(packet.l).toBe(connect.byteLength - 2);
    expect(packet.type()).toBe(PACKET_TYPE.CONNECT);
    expect(packet.dup()).toBe(false);
    expect(packet.qualityOfService()).toBe(0);
    expect(packet.retain()).toBe(false);
  });

  it('parses protocol version', () => {
    const decoder = new MqttDecoder();
    decoder.push(connect);
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet.v).toBe(5);
  });

  it('parses connection flags', () => {
    const decoder = new MqttDecoder();
    decoder.push(connect);
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet.f).toBe(connect.readUInt8(9));
  });

  it('parses keep-alive', () => {
    const decoder = new MqttDecoder();
    decoder.push(connect);
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet.k).toBe(connect.readUInt16BE(10));
  });

  it('parses properties', () => {
    const decoder = new MqttDecoder();
    decoder.push(connect);
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet.p[PROPERTY.ReceiveMaximum]).toBe(20);
  });

  it('parses empty Client ID', () => {
    const decoder = new MqttDecoder();
    decoder.push(connect);
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet).toBeInstanceOf(PacketConnect);
    expect(packet.v).toBe(5);
    expect(packet.f).toBe(2);
    expect(packet.k).toBe(60);
    expect(packet.id).toBe('');
    expect(packet.wt).toBe(undefined);
    expect(packet.w).toBe(undefined);
    expect(packet.usr).toBe(undefined);
    expect(packet.pwd).toBe(undefined);
  });

  it('parses non-empty Client ID', () => {
    const decoder = new MqttDecoder();
    decoder.push(connectWithClientId);
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet).toBeInstanceOf(PacketConnect);
    expect(packet.v).toBe(5);
    expect(packet.f).toBe(2);
    expect(packet.k).toBe(60);
    expect(packet.id).toBe('abc');
    expect(packet.wt).toBe(undefined);
    expect(packet.w).toBe(undefined);
    expect(packet.usr).toBe(undefined);
    expect(packet.pwd).toBe(undefined);
  });

  it('parses strings', () => {
    const decoder = new MqttDecoder();
    // prettier-ignore
    decoder.push(Buffer.from([
      16, 52, // Header
      0x00, 0x04, 0x4d, 0x51, 0x54, 0x54, // Protocol ID
      3, // Protocol version
      246, // Connect flags
      0, 30, // Keep-alive
      0, 4, // Client ID length
      116, 101, 115, 116, // Client ID
      0, 5, // Will topic length
      116, 111, 112, 105, 99, // Will topic
      0, 7, // Will payload length
      112, 97, 121, 108, 111, 97, 100, // Will payload
      0, 8, // Username length
      117, 115, 101, 114, 110, 97, 109, 101, // Username
      0, 8, // Password length
      112, 97, 115, 115, 119, 111, 114, 100 // Password
    ]));
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet).toBeInstanceOf(PacketConnect);
    expect(packet.v).toBe(3);
    expect(packet.f).toBe(246);
    expect(packet.k).toBe(30);
    expect(packet.id).toBe('test');
    expect(packet.wt).toBe('topic');
    expect(packet.w!.toString('utf8')).toBe('payload');
    expect(packet.usr).toBe('username');
    expect(packet.pwd!.toString('utf8')).toBe('password');
  });

  it('parses MQTT 3.1.0 packet', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      16, 18, // Header
      0, 6, // Protocol ID length
      77, 81, 73, 115, 100, 112, // Protocol ID (MQIsdp)
      3, // Protocol version
      0, // Connect flags
      0, 30, // Keep-alive
      0, 4, // Client ID length
      116, 101, 115, 116 // Client ID
    ]));
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet).toBeInstanceOf(PacketConnect);
    expect(packet.b).toBe(16);
    expect(packet.l).toBe(18);
    expect(packet.v).toBe(3);
    expect(packet.f).toBe(0);
    expect(packet.k).toBe(30);
    expect(packet.id).toBe('test');
    expect(packet.p).toEqual({});
    expect(packet.wp).toBe(undefined);
    expect(packet.wt).toBe(undefined);
    expect(packet.w).toBe(undefined);
    expect(packet.usr).toBe(undefined);
    expect(packet.pwd).toBe(undefined);
  });

  it('long packet with properties and will properties', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      16, 125, // Header
      0, 4, // Protocol ID length
      77, 81, 84, 84, // Protocol ID
      5, // Protocol version
      54, // Connect flags
      0, 30, // Keepalive
      47, // properties length
      17, 0, 0, 4, 210, // sessionExpiryInterval
      33, 1, 176, // receiveMaximum
      39, 0, 0, 0, 100, // maximumPacketSize
      34, 1, 200, // topicAliasMaximum
      25, 1, // requestResponseInformation
      23, 1, // requestProblemInformation,
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties,
      21, 0, 4, 116, 101, 115, 116, // authenticationMethod
      22, 0, 4, 1, 2, 3, 4, // authenticationData
      0, 4, // Client ID length
      116, 101, 115, 116, // Client ID
      47, // will properties
      24, 0, 0, 4, 210, // will delay interval
      1, 0, // payload format indicator
      2, 0, 0, 16, 225, // message expiry interval
      3, 0, 4, 116, 101, 115, 116, // content type
      8, 0, 5, 116, 111, 112, 105, 99, // response topic
      9, 0, 4, 1, 2, 3, 4, // corelation data
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // user properties
      0, 5, // Will topic length
      116, 111, 112, 105, 99, // Will topic
      0, 4, // Will payload length
      4, 3, 2, 1// Will payload
    ]));
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet).toBeInstanceOf(PacketConnect);
    expect(packet.b).toBe(16);
    expect(packet.l).toBe(125);
    expect(packet.v).toBe(5);
    expect(packet.f).toBe(54);
    expect(packet.k).toBe(30);
    expect(packet.p).toEqual({
      [PROPERTY.SessionExpiryInterval]: 1234,
      [PROPERTY.ReceiveMaximum]: 432,
      [PROPERTY.MaximumPacketSize]: 100,
      [PROPERTY.TopicAliasMaximum]: 456,
      [PROPERTY.RequestResponseInformation]: 1,
      [PROPERTY.RequestProblemInformation]: 1,
      [PROPERTY.UserProperty]: [
        ['test', 'test'],
      ],
      [PROPERTY.AuthenticationMethod]: 'test',
      [PROPERTY.AuthenticationData]: Buffer.from([1, 2, 3, 4]),
    });
    expect(packet.id).toBe('test');
    expect(packet.wp).toEqual({
      [PROPERTY.WillDelayInterval]: 1234,
      [PROPERTY.PayloadFormatIndicator]: 0,
      [PROPERTY.MessageExpiryInterval]: 4321,
      [PROPERTY.ContentType]: 'test',
      [PROPERTY.ResponseTopic]: 'topic',
      [PROPERTY.CorrelationData]: Buffer.from([1, 2, 3, 4]),
      [PROPERTY.UserProperty]: [
        ['test', 'test'],
      ],
    });
    expect(packet.wt).toBe('topic');
    expect(packet.w).toEqual(Buffer.from([4, 3, 2, 1]));
    expect(packet.usr).toBe(undefined);
    expect(packet.pwd).toBe(undefined);
  });

  it('MQTT 5.0 with will properties but with empty will payload', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      16, 121, // Header
      0, 4, // Protocol ID length
      77, 81, 84, 84, // Protocol ID
      5, // Protocol version
      54, // Connect flags
      0, 30, // Keepalive
      47, // properties length
      17, 0, 0, 4, 210, // sessionExpiryInterval
      33, 1, 176, // receiveMaximum
      39, 0, 0, 0, 100, // maximumPacketSize
      34, 1, 200, // topicAliasMaximum
      25, 1, // requestResponseInformation
      23, 1, // requestProblemInformation,
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties,
      21, 0, 4, 116, 101, 115, 116, // authenticationMethod
      22, 0, 4, 1, 2, 3, 4, // authenticationData
      0, 4, // Client ID length
      116, 101, 115, 116, // Client ID
      47, // will properties
      24, 0, 0, 4, 210, // will delay interval
      1, 0, // payload format indicator
      2, 0, 0, 16, 225, // message expiry interval
      3, 0, 4, 116, 101, 115, 116, // content type
      8, 0, 5, 116, 111, 112, 105, 99, // response topic
      9, 0, 4, 1, 2, 3, 4, // corelation data
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // user properties
      0, 5, // Will topic length
      116, 111, 112, 105, 99, // Will topic
      0, 0 // Will payload length
    ]));
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet).toBeInstanceOf(PacketConnect);
    expect(packet.b).toBe(16);
    expect(packet.l).toBe(121);
    expect(packet.v).toBe(5);
    expect(packet.f).toBe(54);
    expect(packet.k).toBe(30);
    expect(packet.p).toEqual({
      [PROPERTY.SessionExpiryInterval]: 1234,
      [PROPERTY.ReceiveMaximum]: 432,
      [PROPERTY.MaximumPacketSize]: 100,
      [PROPERTY.TopicAliasMaximum]: 456,
      [PROPERTY.RequestResponseInformation]: 1,
      [PROPERTY.RequestProblemInformation]: 1,
      [PROPERTY.UserProperty]: [
        ['test', 'test'],
      ],
      [PROPERTY.AuthenticationMethod]: 'test',
      [PROPERTY.AuthenticationData]: Buffer.from([1, 2, 3, 4]),
    });
    expect(packet.id).toBe('test');
    expect(packet.wp).toEqual({
      [PROPERTY.WillDelayInterval]: 1234,
      [PROPERTY.PayloadFormatIndicator]: 0,
      [PROPERTY.MessageExpiryInterval]: 4321,
      [PROPERTY.ContentType]: 'test',
      [PROPERTY.ResponseTopic]: 'topic',
      [PROPERTY.CorrelationData]: Buffer.from([1, 2, 3, 4]),
      [PROPERTY.UserProperty]: [
        ['test', 'test'],
      ],
    });
    expect(packet.wt).toBe('topic');
    expect(packet.w).toEqual(Buffer.from([]));
    expect(packet.usr).toBe(undefined);
    expect(packet.pwd).toBe(undefined);
  });

  it('MQTT 5.0 w/o will properties', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      16, 78, // Header
      0, 4, // Protocol ID length
      77, 81, 84, 84, // Protocol ID
      5, // Protocol version
      54, // Connect flags
      0, 30, // Keepalive
      47, // properties length
      17, 0, 0, 4, 210, // sessionExpiryInterval
      33, 1, 176, // receiveMaximum
      39, 0, 0, 0, 100, // maximumPacketSize
      34, 1, 200, // topicAliasMaximum
      25, 1, // requestResponseInformation
      23, 1, // requestProblemInformation,
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties,
      21, 0, 4, 116, 101, 115, 116, // authenticationMethod
      22, 0, 4, 1, 2, 3, 4, // authenticationData
      0, 4, // Client ID length
      116, 101, 115, 116, // Client ID
      0, // will properties
      0, 5, // Will topic length
      116, 111, 112, 105, 99, // Will topic
      0, 4, // Will payload length
      4, 3, 2, 1// Will payload
    ]));
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet).toBeInstanceOf(PacketConnect);
    expect(packet.b).toBe(16);
    expect(packet.l).toBe(78);
    expect(packet.v).toBe(5);
    expect(packet.f).toBe(54);
    expect(packet.k).toBe(30);
    expect(packet.p).toEqual({
      [PROPERTY.SessionExpiryInterval]: 1234,
      [PROPERTY.ReceiveMaximum]: 432,
      [PROPERTY.MaximumPacketSize]: 100,
      [PROPERTY.TopicAliasMaximum]: 456,
      [PROPERTY.RequestResponseInformation]: 1,
      [PROPERTY.RequestProblemInformation]: 1,
      [PROPERTY.UserProperty]: [
        ['test', 'test'],
      ],
      [PROPERTY.AuthenticationMethod]: 'test',
      [PROPERTY.AuthenticationData]: Buffer.from([1, 2, 3, 4]),
    });
    expect(packet.id).toBe('test');
    expect(packet.wp).toEqual({});
    expect(packet.wt).toBe('topic');
    expect(packet.w).toEqual(Buffer.from([4, 3, 2, 1]));
    expect(packet.usr).toBe(undefined);
    expect(packet.pwd).toBe(undefined);
  });

  it('MQTT 3.1.1 with client ID', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      16, 18, // Header
      0, 6, // Protocol ID length
      77, 81, 73, 115, 100, 112, // Protocol ID (MQIsdp)
      3, // Protocol version
      0, // Connect flags
      0, 30, // Keep-alive
      0, 4, // Client ID length
      116, 101, 115, 116 // Client ID
    ]));
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet).toBeInstanceOf(PacketConnect);
    expect(packet.b).toBe(16);
    expect(packet.l).toBe(18);
    expect(packet.v).toBe(3);
    expect(packet.f).toBe(0);
    expect(packet.k).toBe(30);
    expect(packet.id).toBe('test');
    expect(packet.p).toEqual({});
    expect(packet.wp).toBe(undefined);
    expect(packet.wt).toBe(undefined);
    expect(packet.w).toBe(undefined);
    expect(packet.usr).toBe(undefined);
    expect(packet.pwd).toBe(undefined);
  });

  it('short packet', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      16, 16,
      0, 4, 77, 81, 84, 84, // Protocol name
      4, // Version
      2, // Flags
      0, 0, // Keep-alive
      0, 4, 116, 101, 115, 116 // Client ID "test"
    ]));
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet).toBeInstanceOf(PacketConnect);
    expect(packet.b).toBe(16);
    expect(packet.l).toBe(16);
    expect(packet.v).toBe(4);
    expect(packet.f).toBe(2);
    expect(packet.k).toBe(0);
    expect(packet.id).toBe('test');
    expect(packet.p).toEqual({});
    expect(packet.wp).toBe(undefined);
    expect(packet.wt).toBe(undefined);
    expect(packet.w).toBe(undefined);
    expect(packet.usr).toBe(undefined);
    expect(packet.pwd).toBe(undefined);
  });

  it('with password and username', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      16, 47, // Header
      0, 6, // Protocol ID length
      77, 81, 73, 115, 100, 112, // Protocol ID
      3, // Protocol version
      246, // Connect flags
      0, 30, // Keepalive
      0, 4, // Client ID length
      116, 101, 115, 116, // Client ID
      0, 5, // Will topic length
      116, 111, 112, 105, 99, // Will topic
      0, 0, // Will payload length
      // Will payload
      0, 8, // Username length
      117, 115, 101, 114, 110, 97, 109, 101, // Username
      0, 8, // Password length
      112, 97, 115, 115, 119, 111, 114, 100 // Password
    ]));
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet).toBeInstanceOf(PacketConnect);
    expect(packet.b).toBe(16);
    expect(packet.l).toBe(47);
    expect(packet.v).toBe(3);
    expect(packet.f).toBe(246);
    expect(packet.k).toBe(30);
    expect(packet.id).toBe('test');
    expect(packet.p).toEqual({});
    expect(packet.wp).toEqual({});
    expect(packet.wt).toBe('topic');
    expect(packet.w).toEqual(Buffer.from([]));
    expect(packet.usr).toBe('username');
    expect(packet.pwd).toEqual(Buffer.from([112, 97, 115, 115, 119, 111, 114, 100]));
  });

  it('empty string username payload', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      16, 20, // Header
      0, 6, // Protocol ID length
      77, 81, 73, 115, 100, 112, // Protocol ID
      3, // Protocol version
      130, // Connect flags
      0, 30, // Keepalive
      0, 4, // Client ID length
      116, 101, 115, 116, // Client ID
      0, 0 // Username length
      // Empty Username payload
    ]));
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet).toBeInstanceOf(PacketConnect);
    expect(packet.b).toBe(16);
    expect(packet.l).toBe(20);
    expect(packet.v).toBe(3);
    expect(packet.f).toBe(130);
    expect(packet.k).toBe(30);
    expect(packet.id).toBe('test');
    expect(packet.p).toEqual({});
    expect(packet.wp).toBe(undefined);
    expect(packet.wt).toBe(undefined);
    expect(packet.w).toBe(undefined);
    expect(packet.usr).toBe('');
    expect(packet.pwd).toBe(undefined);
  });

  it('empty buffer password payload', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      16, 30, // Header
      0, 6, // Protocol ID length
      77, 81, 73, 115, 100, 112, // Protocol ID
      3, // Protocol version
      194, // Connect flags
      0, 30, // Keepalive
      0, 4, // Client ID length
      116, 101, 115, 116, // Client ID
      0, 8, // Username length
      117, 115, 101, 114, 110, 97, 109, 101, // Username payload
      0, 0 // Password length
      // Empty password payload
    ]));
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet).toBeInstanceOf(PacketConnect);
    expect(packet.b).toBe(16);
    expect(packet.l).toBe(30);
    expect(packet.v).toBe(3);
    expect(packet.f).toBe(194);
    expect(packet.k).toBe(30);
    expect(packet.id).toBe('test');
    expect(packet.p).toEqual({});
    expect(packet.wp).toBe(undefined);
    expect(packet.wt).toBe(undefined);
    expect(packet.w).toBe(undefined);
    expect(packet.usr).toBe('username');
    expect(packet.pwd).toEqual(Buffer.from([]));
  });

  it('empty string username and password payload', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      16, 22, // Header
      0, 6, // Protocol ID length
      77, 81, 73, 115, 100, 112, // Protocol ID
      3, // Protocol version
      194, // Connect flags
      0, 30, // Keepalive
      0, 4, // Client ID length
      116, 101, 115, 116, // Client ID
      0, 0, // Username length
      // Empty Username payload
      0, 0 // Password length
      // Empty password payload
    ]));
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet).toBeInstanceOf(PacketConnect);
    expect(packet.b).toBe(16);
    expect(packet.l).toBe(22);
    expect(packet.v).toBe(3);
    expect(packet.f).toBe(194);
    expect(packet.k).toBe(30);
    expect(packet.id).toBe('test');
    expect(packet.p).toEqual({});
    expect(packet.wp).toBe(undefined);
    expect(packet.wt).toBe(undefined);
    expect(packet.w).toBe(undefined);
    expect(packet.usr).toBe('');
    expect(packet.pwd).toEqual(Buffer.from([]));
  });

  it('MQTT 3.1.0 packet with username and password', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      16, 54, // Header
      0, 6, // Protocol ID length
      77, 81, 73, 115, 100, 112, // Protocol ID
      3, // Protocol version
      246, // Connect flags
      0, 30, // Keepalive
      0, 4, // Client ID length
      116, 101, 115, 116, // Client ID
      0, 5, // Will topic length
      116, 111, 112, 105, 99, // Will topic
      0, 7, // Will payload length
      112, 97, 121, 108, 111, 97, 100, // Will payload
      0, 8, // Username length
      117, 115, 101, 114, 110, 97, 109, 101, // Username
      0, 8, // Password length
      112, 97, 115, 115, 119, 111, 114, 100 // Password
    ]));
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet).toBeInstanceOf(PacketConnect);
    expect(packet.b).toBe(16);
    expect(packet.l).toBe(54);
    expect(packet.v).toBe(3);
    expect(packet.f).toBe(246);
    expect(packet.k).toBe(30);
    expect(packet.id).toBe('test');
    expect(packet.p).toEqual({});
    expect(packet.wp).toEqual({});
    expect(packet.wt).toBe('topic');
    expect(packet.w).toEqual(Buffer.from([112, 97, 121, 108, 111, 97, 100]));
    expect(packet.usr).toBe('username');
    expect(packet.pwd).toEqual(Buffer.from([112, 97, 115, 115, 119, 111, 114, 100]));
  });

  it('special chars', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      16, 57, // Header
      0, 6, // Protocol ID length
      77, 81, 73, 115, 100, 112, // Protocol ID
      3, // Protocol version
      246, // Connect flags
      0, 30, // Keepalive
      0, 4, // Client ID length
      116, 101, 36, 116, // Client ID
      0, 6, // Will topic length
      116, 195, 178, 112, 105, 99, // Will topic
      0, 8, // Will payload length
      112, 97, 121, 194, 163, 111, 97, 100, // Will payload
      0, 8, // Username length
      117, 36, 101, 114, 110, 52, 109, 101, // Username
      0, 9, // Password length
      112, 52, 36, 36, 119, 48, 194, 163, 100 // Password
    ]));
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet).toBeInstanceOf(PacketConnect);
    expect(packet.b).toBe(16);
    expect(packet.l).toBe(57);
    expect(packet.v).toBe(3);
    expect(packet.f).toBe(246);
    expect(packet.k).toBe(30);
    expect(packet.id).toBe('te$t');
    expect(packet.p).toEqual({});
    expect(packet.wp).toEqual({});
    expect(packet.wt).toBe('tòpic');
    expect(packet.w).toEqual(Buffer.from([112, 97, 121, 194, 163, 111, 97, 100]));
    expect(packet.usr).toBe('u$ern4me');
    expect(packet.pwd!.toString('utf8')).toBe('p4$$w0£d');
  });

  it('throws on invalid packet', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      16, 4,
      0, 6,
      77, 81
    ]));
    let error;
    try {
      decoder.parse();
    } catch (err) { error = err; }
    expect(error).toBe(ERROR.MALFORMED_PACKET);
  });

  it('throws on missing Protocol Version', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      16, 8, // Header
      0, 6, // Protocol ID length
      77, 81, 73, 115, 100, 112 // Protocol ID
    ]));
    let error;
    try {
      decoder.parse();
    } catch (err) { error = err; }
    expect(error).toBe(ERROR.MALFORMED_PACKET);
  });

  it('throws on missing Keep-alive', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      16, 10, // Header
      0, 6, // Protocol ID length
      77, 81, 73, 115, 100, 112, // Protocol ID
      3, // Protocol version
      246 // Connect flags
    ]));
    let error;
    try {
      decoder.parse();
    } catch (err) { error = err; }
    expect(error).toBe(ERROR.MALFORMED_PACKET);
  });

  it('throws on missing Client ID', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      16, 10, // Header
      0, 6, // Protocol ID length
      77, 81, 73, 115, 100, 112, // Protocol ID
      3, // Protocol version
      246, // Connect flags
      0, 30 // Keepalive
    ]));
    let error;
    try {
      decoder.parse();
    } catch (err) { error = err; }
    expect(error).toBe(ERROR.MALFORMED_PACKET);
  });

  it('throws on missing Will Topic', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      16, 16, // Header
      0, 6, // Protocol ID length
      77, 81, 73, 115, 100, 112, // Protocol ID
      3, // Protocol version
      246, // Connect flags
      0, 30, // Keepalive
      0, 2, // Will topic length
      0, 0 // Will topic
    ]));
    let error;
    try {
      decoder.parse();
    } catch (err) { error = err; }
    expect(error).toBe(ERROR.MALFORMED_PACKET);
  });

  it('throws on invalid Will Payload', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      16, 23, // Header
      0, 6, // Protocol ID length
      77, 81, 73, 115, 100, 112, // Protocol ID
      3, // Protocol version
      246, // Connect flags
      0, 30, // Keepalive
      0, 5, // Will topic length
      116, 111, 112, 105, 99, // Will topic
      0, 2, // Will payload length
      0, 0 // Will payload
    ]));
    let error;
    try {
      decoder.parse();
    } catch (err) { error = err; }
    expect(error).toBe(ERROR.MALFORMED_PACKET);
  });

  it('throws on invalid User Name', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      16, 32, // Header
      0, 6, // Protocol ID length
      77, 81, 73, 115, 100, 112, // Protocol ID
      3, // Protocol version
      246, // Connect flags
      0, 30, // Keepalive
      0, 5, // Will topic length
      116, 111, 112, 105, 99, // Will topic
      0, 7, // Will payload length
      112, 97, 121, 108, 111, 97, 100, // Will payload
      0, 2, // Username length
      0, 0 // Username
    ]));
    let error;
    try {
      decoder.parse();
    } catch (err) { error = err; }
    expect(error).toBe(ERROR.MALFORMED_PACKET);
  });

  it('throws on invalid Password', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      16, 42, // Header
      0, 6, // Protocol ID length
      77, 81, 73, 115, 100, 112, // Protocol ID
      3, // Protocol version
      246, // Connect flags
      0, 30, // Keepalive
      0, 5, // Will topic length
      116, 111, 112, 105, 99, // Will topic
      0, 7, // Will payload length
      112, 97, 121, 108, 111, 97, 100, // Will payload
      0, 8, // Username length
      117, 115, 101, 114, 110, 97, 109, 101, // Username
      0, 2, // Password length
      0, 0 // Password
    ]));
    let error;
    try {
      decoder.parse();
    } catch (err) { error = err; }
    expect(error).toBe(ERROR.MALFORMED_PACKET);
  });
});

describe('CONNACK', () => {
  it('simple packet with 0 Reason Code', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      32, 2, 0, 0
    ]));
    const packet: PacketConnack = decoder.parse() as PacketConnack;
    expect(packet).toBeInstanceOf(PacketConnack);
    expect(packet.b).toBe(32);
    expect(packet.l).toBe(2);
    expect(packet.c).toBe(0);
  });

  it('can parse CONNACK packet fixed header', () => {
    const decoder = new MqttDecoder();
    decoder.push(connectAck);
    const packet = decoder.parse()! as PacketConnack;
    expect(packet).toBeInstanceOf(PacketConnack);
    expect(packet!.l).toBe(connectAck.byteLength - 2);
    expect(packet!.type()).toBe(PACKET_TYPE.CONNACK);
    expect(packet!.dup()).toBe(false);
    expect(packet!.qualityOfService()).toBe(0);
    expect(packet!.retain()).toBe(false);
  });

  it('parses variable header', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    decoder.push(connectAck);
    const packet: PacketConnack = decoder.parse() as PacketConnack;
    expect(packet).toBeInstanceOf(PacketConnack);
    expect(packet.f).toBe(0);
    expect(packet.c).toBe(1);
    expect(packet.p).toEqual({
      [PROPERTY.TopicAliasMaximum]: 10,
      [PROPERTY.AssignedClientIdentifier]: 'auto-A685BAC0-7182-E166-242A-3FD8358C03C8',
    });
  });

  it('parses MQTT 5.0 packet with properties', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    decoder.push(Buffer.from([
      32, 87, 0, 0,
      84, // properties length
      17, 0, 0, 4, 210, // sessionExpiryInterval
      33, 1, 176, // receiveMaximum
      36, 2, // Maximum qos
      37, 1, // retainAvailable
      39, 0, 0, 0, 100, // maximumPacketSize
      18, 0, 4, 116, 101, 115, 116, // assignedClientIdentifier
      34, 1, 200, // topicAliasMaximum
      31, 0, 4, 116, 101, 115, 116, // reasonString
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
      40, 1, // wildcardSubscriptionAvailable
      41, 1, // subscriptionIdentifiersAvailable
      42, 0, // sharedSubscriptionAvailable
      19, 4, 210, // serverKeepAlive
      26, 0, 4, 116, 101, 115, 116, // responseInformation
      28, 0, 4, 116, 101, 115, 116, // serverReference
      21, 0, 4, 116, 101, 115, 116, // authenticationMethod
      22, 0, 4, 1, 2, 3, 4 // authenticationData
    ]));
    const packet: PacketConnack = decoder.parse() as PacketConnack;
    expect(packet).toBeInstanceOf(PacketConnack);
    expect(packet.b).toBe(32);
    expect(packet.l).toBe(87);
    expect(packet.c).toBe(0);
    expect(packet.p).toEqual({
      [PROPERTY.SessionExpiryInterval]: 1234,
      [PROPERTY.ReceiveMaximum]: 432,
      [PROPERTY.MaximumQoS]: 2,
      [PROPERTY.RetainAvailable]: 1,
      [PROPERTY.MaximumPacketSize]: 100,
      [PROPERTY.AssignedClientIdentifier]: 'test',
      [PROPERTY.UserProperty]: [
        ['test', 'test'],
      ],
      [PROPERTY.WildcardSubscriptionAvailable]: 1,
      [PROPERTY.SubscriptionIdentifierAvailable]: 1,
      [PROPERTY.ServerKeepAlive]: 1234,
      [PROPERTY.ResponseInformation]: 'test',
      [PROPERTY.ServerReference]: 'test',
      [PROPERTY.AuthenticationMethod]: 'test',
      [PROPERTY.AuthenticationData]: Buffer.from([1, 2, 3, 4]),
      [PROPERTY.ReasonString]: 'test',
      [PROPERTY.TopicAliasMaximum]: 456,
      [PROPERTY.SharedSubscriptionAvailable]: 0,
    });
  });

  it('parses MQTT 5.0 with properties and doubled user properties', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    decoder.push(Buffer.from([
      32, 100, 0, 0,
      97, // properties length
      17, 0, 0, 4, 210, // sessionExpiryInterval
      33, 1, 176, // receiveMaximum
      36, 2, // Maximum qos
      37, 1, // retainAvailable
      39, 0, 0, 0, 100, // maximumPacketSize
      18, 0, 4, 116, 101, 115, 116, // assignedClientIdentifier
      34, 1, 200, // topicAliasMaximum
      31, 0, 4, 116, 101, 115, 116, // reasonString
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116,
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
      40, 1, // wildcardSubscriptionAvailable
      41, 1, // subscriptionIdentifiersAvailable
      42, 0, // sharedSubscriptionAvailable
      19, 4, 210, // serverKeepAlive
      26, 0, 4, 116, 101, 115, 116, // responseInformation
      28, 0, 4, 116, 101, 115, 116, // serverReference
      21, 0, 4, 116, 101, 115, 116, // authenticationMethod
      22, 0, 4, 1, 2, 3, 4 // authenticationData
    ]));
    const packet: PacketConnack = decoder.parse() as PacketConnack;
    expect(packet).toBeInstanceOf(PacketConnack);
    expect(packet.b).toBe(32);
    expect(packet.l).toBe(100);
    expect(packet.c).toBe(0);
    expect(packet.p).toEqual({
      [PROPERTY.SessionExpiryInterval]: 1234,
      [PROPERTY.ReceiveMaximum]: 432,
      [PROPERTY.MaximumQoS]: 2,
      [PROPERTY.RetainAvailable]: 1,
      [PROPERTY.MaximumPacketSize]: 100,
      [PROPERTY.AssignedClientIdentifier]: 'test',
      [PROPERTY.UserProperty]: [
        ['test', 'test'],
        ['test', 'test'],
      ],
      [PROPERTY.WildcardSubscriptionAvailable]: 1,
      [PROPERTY.SubscriptionIdentifierAvailable]: 1,
      [PROPERTY.ServerKeepAlive]: 1234,
      [PROPERTY.ResponseInformation]: 'test',
      [PROPERTY.ServerReference]: 'test',
      [PROPERTY.AuthenticationMethod]: 'test',
      [PROPERTY.AuthenticationData]: Buffer.from([1, 2, 3, 4]),
      [PROPERTY.ReasonString]: 'test',
      [PROPERTY.TopicAliasMaximum]: 456,
      [PROPERTY.SharedSubscriptionAvailable]: 0,
    });
  });

  it('with return code 0 session present bit set', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      32, 2, 1, 0
    ]));
    const packet: PacketConnack = decoder.parse() as PacketConnack;
    expect(packet).toBeInstanceOf(PacketConnack);
    expect(packet.b).toBe(32);
    expect(packet.l).toBe(2);
    expect(packet.f).toBe(1);
    expect(packet.c).toBe(0);
    expect(packet.p).toEqual({});
    expect(packet.sessionPresent()).toBe(true);
  });

  it('with return code 5', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      32, 2, 0, 5
    ]));
    const packet: PacketConnack = decoder.parse() as PacketConnack;
    expect(packet).toBeInstanceOf(PacketConnack);
    expect(packet.b).toBe(32);
    expect(packet.l).toBe(2);
    expect(packet.f).toBe(0);
    expect(packet.c).toBe(5);
    expect(packet.p).toEqual({});
    expect(packet.sessionPresent()).toBe(false);
  });
});

describe('PUBLISH', () => {
  it('parses PUBLISH variable data', () => {
    const decoder = new MqttDecoder();
    decoder.push(publish3111);
    const packet: PacketPublish = decoder.parse() as PacketPublish;
    expect(packet).toBeInstanceOf(PacketPublish);
    expect(packet.b).toBe(publish3111.readUInt8(0));
    expect(packet.l).toBe(publish3111.readUInt8(1));
    expect(packet.t).toBe('zibel32/18fe34f1d68e/$name');
    expect(packet.i).toBe(0);
    expect(packet.p).toEqual({});
    expect(packet.d.toString()).toMatchInlineSnapshot(`"Zibel32 Garage Door"`);
  });

  it('parses minimal PUBLISH packet', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      48, 10, // Header
      0, 4, // Topic length
      116, 101, 115, 116, // Topic (test)
      116, 101, 115, 116 // Payload (test)
    ]));
    const packet: PacketPublish = decoder.parse() as PacketPublish;
    expect(packet).toBeInstanceOf(PacketPublish);
    expect(packet.b).toBe(48);
    expect(packet.l).toBe(10);
    expect(packet.t).toBe('test');
    expect(packet.i).toBe(0);
    expect(packet.p).toEqual({});
    expect(packet.d.toString('utf8')).toBe('test');
  });

  it('parses MQTT 5.0 packet with properties', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    decoder.push(Buffer.from([
      61, 86, // Header
      0, 4, // Topic length
      116, 101, 115, 116, // Topic (test)
      0, 10, // Message ID
      73, // properties length
      1, 1, // payloadFormatIndicator
      2, 0, 0, 16, 225, // message expiry interval
      35, 0, 100, // topicAlias
      8, 0, 5, 116, 111, 112, 105, 99, // response topic
      9, 0, 4, 1, 2, 3, 4, // correlationData
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
      11, 120, // subscriptionIdentifier
      3, 0, 4, 116, 101, 115, 116, // content type
      116, 101, 115, 116 // Payload (test)
    ]));
    const packet: PacketPublish = decoder.parse() as PacketPublish;
    expect(packet).toBeInstanceOf(PacketPublish);
    expect(packet.b).toBe(61);
    expect(packet.l).toBe(86);
    expect(packet.t).toBe('test');
    expect(packet.i).toBe(10);
    expect(packet.p).toEqual({
      [PROPERTY.PayloadFormatIndicator]: 1,
      [PROPERTY.MessageExpiryInterval]: 4321,
      [PROPERTY.ResponseTopic]: 'topic',
      [PROPERTY.CorrelationData]: Buffer.from([1, 2, 3, 4]),
      [PROPERTY.UserProperty]: [
        ['test', 'test'],
        ['test', 'test'],
        ['test', 'test'],
      ],
      [PROPERTY.SubscriptionIdentifier]: 120,
      [PROPERTY.ContentType]: 'test',
      [PROPERTY.TopicAlias]: 100,
    });
    expect(packet.d.toString('utf8')).toBe('test');
  });

  it('parses MQTT 5.0 packet with repeating properties', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    decoder.push(Buffer.from([
      61, 64, // Header
      0, 4, // Topic length
      116, 101, 115, 116, // Topic (test)
      0, 10, // Message ID
      51, // properties length
      1, 1, // payloadFormatIndicator
      2, 0, 0, 16, 225, // message expiry interval
      35, 0, 100, // topicAlias
      8, 0, 5, 116, 111, 112, 105, 99, // response topic
      9, 0, 4, 1, 2, 3, 4, // correlationData
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
      11, 120, // subscriptionIdentifier
      11, 121, // subscriptionIdentifier
      11, 122, // subscriptionIdentifier
      3, 0, 4, 116, 101, 115, 116, // content type
      116, 101, 115, 116 // Payload (test)
    ]));
    const packet: PacketPublish = decoder.parse() as PacketPublish;
    expect(packet).toBeInstanceOf(PacketPublish);
    expect(packet.b).toBe(61);
    expect(packet.l).toBe(64);
    expect(packet.t).toBe('test');
    expect(packet.i).toBe(10);
    expect(packet.p).toEqual({
      [PROPERTY.PayloadFormatIndicator]: 1,
      [PROPERTY.MessageExpiryInterval]: 4321,
      [PROPERTY.ResponseTopic]: 'topic',
      [PROPERTY.CorrelationData]: Buffer.from([1, 2, 3, 4]),
      [PROPERTY.UserProperty]: [
        ['test', 'test'],
      ],
      [PROPERTY.SubscriptionIdentifier]: 122,
      [PROPERTY.ContentType]: 'test',
      [PROPERTY.TopicAlias]: 100,
    });
    expect(packet.d.toString('utf8')).toBe('test');
  });

  it('parses MQTT 5.0 packet with 0-4 byte varbyte', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    decoder.push(Buffer.from([
      61, 27, // Header
      0, 4, // Topic length
      116, 101, 115, 116, // Topic (test)
      0, 10, // Message ID
      14, // properties length
      1, 0, // payloadFormatIndicator
      11, 128, 1, // subscriptionIdentifier
      11, 128, 128, 1, // subscriptionIdentifier
      11, 128, 128, 128, 1, // subscriptionIdentifier
      116, 101, 115, 116 // Payload (test)
    ]));
    const packet: PacketPublish = decoder.parse() as PacketPublish;
    expect(packet).toBeInstanceOf(PacketPublish);
    expect(packet.b).toBe(61);
    expect(packet.l).toBe(27);
    expect(packet.t).toBe('test');
    expect(packet.i).toBe(10);
    expect(packet.p).toEqual({
      [PROPERTY.PayloadFormatIndicator]: 0,
      [PROPERTY.SubscriptionIdentifier]: 2097152,
    });
    expect(packet.d.toString('utf8')).toBe('test');
  });

  it('parses 2Kb MQTT 3.1.1 packet', () => {
    const decoder = new MqttDecoder();
    const payload = Buffer.allocUnsafe(2048);
    decoder.push(Buffer.concat([Buffer.from([
      48, 134, 16, // Header
      0, 4, // Topic length
      116, 101, 115, 116 // Topic (test)
    ]), payload]));
    const packet: PacketPublish = decoder.parse() as PacketPublish;
    expect(packet).toBeInstanceOf(PacketPublish);
    expect(packet.b).toBe(48);
    expect(packet.l).toBe(2054);
    expect(packet.t).toBe('test');
    expect(packet.i).toBe(0);
    expect(packet.p).toEqual({});
    expect(packet.d.byteLength).toBe(2048);
    expect(packet.d.equals(payload)).toBe(true);
  });

  it('parses 2Kb MQTT 5.0 packet', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    const payload = Buffer.allocUnsafe(2048);
    decoder.push(Buffer.concat([Buffer.from([
      48, 135, 16, // Header
      0, 4, // Topic length
      116, 101, 115, 116, // Topic (test)
      0, // Properties
    ]), payload]));
    const packet: PacketPublish = decoder.parse() as PacketPublish;
    expect(packet).toBeInstanceOf(PacketPublish);
    expect(packet.b).toBe(48);
    expect(packet.l).toBe(2048 + 7);
    expect(packet.t).toBe('test');
    expect(packet.i).toBe(0);
    expect(packet.p).toEqual({});
    expect(packet.d.byteLength).toBe(2048);
    expect(packet.d.equals(payload)).toBe(true);
  });

  it('parses 2Mb MQTT 3.1.1 packet', () => {
    const decoder = new MqttDecoder();
    const payload = Buffer.alloc(2 * 1024 * 1024);
    decoder.push(Buffer.concat([Buffer.from([
      48, 134, 128, 128, 1, // Header
      0, 4, // Topic length
      116, 101, 115, 116 // Topic (test)
    ]), payload]));
    const packet: PacketPublish = decoder.parse() as PacketPublish;
    expect(packet).toBeInstanceOf(PacketPublish);
    expect(packet.b).toBe(48);
    expect(packet.l).toBe(2097158);
    expect(packet.t).toBe('test');
    expect(packet.i).toBe(0);
    expect(packet.p).toEqual({});
    expect(packet.d.byteLength).toBe(2 * 1024 * 1024);
    expect(packet.d.equals(payload)).toBe(true);
  });

  it('parses empty payload', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      48, 6, // Header
      0, 4, // Topic length
      116, 101, 115, 116 // Topic
      // Empty payload
    ]));
    const packet: PacketPublish = decoder.parse() as PacketPublish;
    expect(packet).toBeInstanceOf(PacketPublish);
    expect(packet.b).toBe(48);
    expect(packet.l).toBe(6);
    expect(packet.t).toBe('test');
    expect(packet.i).toBe(0);
    expect(packet.p).toEqual({});
    expect(packet.d.byteLength).toBe(0);
  });

  it('parses packet split int two chunks', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      48, 10, // Header
      0, 4, // Topic length
      116, 101, 115, 116 // Topic (test)
    ]));
    expect(!!decoder.parse()).toBe(false);
    decoder.push(Buffer.from([
      116, 101, 115, 116 // Payload (test)
    ]));
    const packet: PacketPublish = decoder.parse() as PacketPublish;
    expect(packet).toBeInstanceOf(PacketPublish);
    expect(packet.b).toBe(48);
    expect(packet.l).toBe(10);
    expect(packet.t).toBe('test');
    expect(packet.i).toBe(0);
    expect(packet.p).toEqual({});
    expect(packet.d).toEqual(Buffer.from([116, 101, 115, 116]));
  });
});

describe('PUBACK', () => {
  it('parses 3.1.1 packet', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      64, 2, // Header
      0, 2 // Message ID
    ]));
    const packet: PacketPuback = decoder.parse() as PacketPuback;
    expect(packet).toBeInstanceOf(PacketPuback);
    expect(packet.b).toBe(64);
    expect(packet.l).toBe(2);
    expect(packet.i).toBe(2);
    expect(packet.c).toBe(0);
    expect(packet.p).toEqual({});
  });

  it('with reason and no MQTT 5 properties', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    decoder.push(Buffer.from([
      64, 3, // Header
      0, 2, // Message ID
      16 // reason code
    ]));
    const packet: PacketPuback = decoder.parse() as PacketPuback;
    expect(packet).toBeInstanceOf(PacketPuback);
    expect(packet.b).toBe(64);
    expect(packet.l).toBe(3);
    expect(packet.i).toBe(2);
    expect(packet.c).toBe(16);
    expect(packet.p).toEqual({});
  });

  it('with MQTT 5 properties', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    decoder.push(Buffer.from([
      64, 24, // Header
      0, 2, // Message ID
      16, // reason code
      20, // properties length
      31, 0, 4, 116, 101, 115, 116, // reasonString
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116 // userProperties
    ]));
    const packet: PacketPuback = decoder.parse() as PacketPuback;
    expect(packet).toBeInstanceOf(PacketPuback);
    expect(packet.b).toBe(64);
    expect(packet.l).toBe(24);
    expect(packet.i).toBe(2);
    expect(packet.c).toBe(16);
    expect(packet.p).toEqual({
      [PROPERTY.ReasonString]: 'test',
      [PROPERTY.UserProperty]: [['test', 'test']],
    });
  });
});

describe('PUBREC', () => {
  it('parses MQTT 3.1.1 packet', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      80, 2, // Header
      0, 2 // Message ID
    ]));
    const packet: PacketPubrec = decoder.parse() as PacketPubrec;
    expect(packet).toBeInstanceOf(PacketPubrec);
    expect(packet.b).toBe(80);
    expect(packet.l).toBe(2);
    expect(packet.i).toBe(2);
    expect(packet.c).toBe(0);
    expect(packet.p).toEqual({});
  });

  it('parses MQTT 5 properties', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    decoder.push(Buffer.from([
      80, 24, // Header
      0, 2, // Message ID
      16, // reason code
      20, // properties length
      31, 0, 4, 116, 101, 115, 116, // reasonString
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116 // userProperties
    ]));
    const packet: PacketPubrec = decoder.parse() as PacketPubrec;
    expect(packet).toBeInstanceOf(PacketPubrec);
    expect(packet.b).toBe(80);
    expect(packet.l).toBe(24);
    expect(packet.i).toBe(2);
    expect(packet.c).toBe(16);
    expect(packet.p).toEqual({
      [PROPERTY.ReasonString]: 'test',
      [PROPERTY.UserProperty]: [['test', 'test']],
    });
  });
});

describe('PUBREL', () => {
  it('parses MQTT 3.1.1 packet', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      98, 2, // Header
      0, 2 // Message ID
    ]));
    const packet: PacketPubrel = decoder.parse() as PacketPubrel;
    expect(packet).toBeInstanceOf(PacketPubrel);
    expect(packet.b).toBe(98);
    expect(packet.l).toBe(2);
    expect(packet.i).toBe(2);
    expect(packet.c).toBe(0);
    expect(packet.p).toEqual({});
  });

  it('parses MQTT 5 properties', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    decoder.push(Buffer.from([
      98, 24, // Header
      0, 2, // Message ID
      16, // reason code
      20, // properties length
      31, 0, 4, 116, 101, 115, 116, // reasonString
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116 // userProperties
    ]));
    const packet: PacketPubrel = decoder.parse() as PacketPubrel;
    expect(packet).toBeInstanceOf(PacketPubrel);
    expect(packet.b).toBe(98);
    expect(packet.l).toBe(24);
    expect(packet.i).toBe(2);
    expect(packet.c).toBe(16);
    expect(packet.p).toEqual({
      [PROPERTY.ReasonString]: 'test',
      [PROPERTY.UserProperty]: [['test', 'test']],
    });
  });
});

describe('PUBCOMP', () => {
  it('parses MQTT 3.1.1 packet', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      112, 2, // Header
      0, 2 // Message ID
    ]));
    const packet: PacketPubcomp = decoder.parse() as PacketPubcomp;
    expect(packet).toBeInstanceOf(PacketPubcomp);
    expect(packet.b).toBe(112);
    expect(packet.l).toBe(2);
    expect(packet.i).toBe(2);
    expect(packet.c).toBe(0);
    expect(packet.p).toEqual({});
  });

  it('parses MQTT 5 properties', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    decoder.push(Buffer.from([
      112, 24, // Header
      0, 2, // Message ID
      16, // reason code
      20, // properties length
      31, 0, 4, 116, 101, 115, 116, // reasonString
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116 // userProperties
    ]));
    const packet: PacketPubcomp = decoder.parse() as PacketPubcomp;
    expect(packet).toBeInstanceOf(PacketPubcomp);
    expect(packet.b).toBe(112);
    expect(packet.l).toBe(24);
    expect(packet.i).toBe(2);
    expect(packet.c).toBe(16);
    expect(packet.p).toEqual({
      [PROPERTY.ReasonString]: 'test',
      [PROPERTY.UserProperty]: [
        ['test', 'test'],
      ],
    });
  });
});

describe('SUBSCRIBE', () => {
  it('parses MQTT 3.1.1 packet', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      130, 9, // Header (subscribeqos=1length=9)
      0, 6, // Message ID (6)
      0, 4, // Topic length,
      116, 101, 115, 116, // Topic (test)
      0 // Qos (0)
    ]));
    const packet: PacketSubscribe = decoder.parse() as PacketSubscribe;
    expect(packet).toBeInstanceOf(PacketSubscribe);
    expect(packet.b).toBe(130);
    expect(packet.l).toBe(9);
    expect(packet.i).toBe(6);
    expect(packet.p).toEqual({});
    expect(packet.s).toMatchObject([
      {
        t: 'test',
        f: 0,
      },
    ]);
  });

  it('can subscribe to one topic using MQTT 5.0', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    decoder.push(Buffer.from([
      130, 26, // Header (subscribeqos=1length=9)
      0, 6, // Message ID (6)
      16, // properties length
      11, 145, 1, // subscriptionIdentifier
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
      0, 4, // Topic length,
      116, 101, 115, 116, // Topic (test)
      24 // settings(qos: 0, noLocal: false, Retain as Published: true, retain handling: 1)
    ]));
    const packet: PacketSubscribe = decoder.parse() as PacketSubscribe;
    expect(packet).toBeInstanceOf(PacketSubscribe);
    expect(packet.b).toBe(130);
    expect(packet.l).toBe(26);
    expect(packet.i).toBe(6);
    expect(packet.p).toEqual({
      [PROPERTY.SubscriptionIdentifier]: 145,
      [PROPERTY.UserProperty]: [['test', 'test']],
    });
    expect(packet.s.length).toBe(1);
    expect(packet.s[0].t).toBe('test');
    expect(packet.s[0].f).toBe(24);
  });

  it('can subscribe to 3 MQTT 3.1.1 topics', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      130, 23, // Header (publishqos=1length=9)
      0, 6, // Message ID (6)
      0, 4, // Topic length,
      116, 101, 115, 116, // Topic (test)
      0, // Qos (0)
      0, 4, // Topic length
      117, 101, 115, 116, // Topic (uest)
      1, // Qos (1)
      0, 4, // Topic length
      116, 102, 115, 116, // Topic (tfst)
      2 // Qos (2)
    ]));
    const packet: PacketSubscribe = decoder.parse() as PacketSubscribe;
    expect(packet).toBeInstanceOf(PacketSubscribe);
    expect(packet).toMatchObject({
      b: 130,
      l: 23,
      i: 6,
      p: {},
      s: [
        {
          t: 'test',
          f: 0,
        },
        {
          t: 'uest',
          f: 1,
        },
        {
          t: 'tfst',
          f: 2,
        },
      ],
    });
  });

  it('can subscribe to 3 MQTT 5.0 topics', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    decoder.push(Buffer.from([
      130, 40, // Header (subscribeqos=1length=9)
      0, 7, // Message ID (6)
      16, // properties length
      11, 145, 1, // subscriptionIdentifier
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
      0, 4, // Topic length,
      116, 101, 115, 116, // Topic (test)
      24, // settings(qos: 0, noLocal: false, Retain as Published: true, retain handling: 1)
      0, 4, // Topic length
      117, 101, 115, 116, // Topic (uest)
      1, // Qos (1)
      0, 4, // Topic length
      116, 102, 115, 116, // Topic (tfst)
      6 // Qos (2), No Local: true
    ]));
    const packet: PacketSubscribe = decoder.parse() as PacketSubscribe;
    expect(packet).toBeInstanceOf(PacketSubscribe);
    expect(packet).toMatchObject({
      b: 130,
      l: 40,
      i: 7,
      p: {
        [PROPERTY.SubscriptionIdentifier]: 145,
        [PROPERTY.UserProperty]: [['test', 'test']],
      },
      s: [
        {
          t: 'test',
          f: 24,
        },
        {
          t: 'uest',
          f: 1,
        },
        {
          t: 'tfst',
          f: 6,
        },
      ],
    });

    expect(packet.s[0].qualityOfService()).toBe(0);
    expect(packet.s[0].noLocal()).toBe(false);
    expect(packet.s[0].retainAsPublished()).toBe(true);
    expect(packet.s[0].retainHandling()).toBe(1);

    expect(packet.s[1].qualityOfService()).toBe(1);
    expect(packet.s[1].noLocal()).toBe(false);
    expect(packet.s[1].retainAsPublished()).toBe(false);
    expect(packet.s[1].retainHandling()).toBe(0);

    expect(packet.s[2].qualityOfService()).toBe(2);
    expect(packet.s[2].noLocal()).toBe(true);
    expect(packet.s[2].retainAsPublished()).toBe(false);
    expect(packet.s[2].retainHandling()).toBe(0);
  });
});

describe('SUBACK', () => {
  it('parses MQTT 3.1.1 packet', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      144, 6, // Header
      0, 6, // Message ID
      0, 1, 2, 128 // Granted qos (0, 1, 2) and a rejected being 0x80
    ]));
    const packet: PacketSuback = decoder.parse() as PacketSuback;
    expect(packet).toBeInstanceOf(PacketSuback);
    expect(packet.b).toBe(144);
    expect(packet.l).toBe(6);
    expect(packet.i).toBe(6);
    expect(packet.p).toEqual({});
    expect(packet.s).toEqual([0, 1, 2, 128]);
  });

  it('parses MQTT 5.0 packet', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    decoder.push(Buffer.from([
      144, 27, // Header
      0, 6, // Message ID
      20, // properties length
      31, 0, 4, 116, 101, 115, 116, // reasonString
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
      0, 1, 2, 1 // Granted qos (0, 1, 2) and a rejected being 0x80
    ]));
    const packet: PacketSuback = decoder.parse() as PacketSuback;
    expect(packet).toBeInstanceOf(PacketSuback);
    expect(packet.b).toBe(144);
    expect(packet.l).toBe(27);
    expect(packet.i).toBe(6);
    expect(packet.p).toEqual({
      [PROPERTY.ReasonString]: 'test',
      [PROPERTY.UserProperty]: [['test', 'test']],
    });
    expect(packet.s).toEqual([0, 1, 2, 1]);
  });
});

describe('UNSUBSCRIBE', () => {
  it('parses MQTT 3.1.1 packet', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      162, 14,
      0, 7, // Message ID (7)
      0, 4, // Topic length
      116, 102, 115, 116, // Topic (tfst)
      0, 4, // Topic length,
      116, 101, 115, 116 // Topic (test)
    ]));
    const packet: PacketUnsubscribe = decoder.parse() as PacketUnsubscribe;
    expect(packet).toBeInstanceOf(PacketUnsubscribe);
    expect(packet.b).toBe(162);
    expect(packet.l).toBe(14);
    expect(packet.i).toBe(7);
    expect(packet.s).toEqual(['tfst', 'test']);
  });

  it('parses MQTT 5.0 packet', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    decoder.push(Buffer.from([
      162, 28,
      0, 7, // Message ID (7)
      13, // properties length
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
      0, 4, // Topic length
      116, 102, 115, 116, // Topic (tfst)
      0, 4, // Topic length,
      116, 101, 115, 116 // Topic (test)
    ]));
    const packet: PacketUnsubscribe = decoder.parse() as PacketUnsubscribe;
    expect(packet).toBeInstanceOf(PacketUnsubscribe);
    expect(packet.b).toBe(162);
    expect(packet.l).toBe(28);
    expect(packet.i).toBe(7);
    expect(packet.p).toEqual({
      [PROPERTY.UserProperty]: [['test', 'test']],
    });
    expect(packet.s).toEqual(['tfst', 'test']);
  });
});

describe('UNSUBACK', () => {
  it('parses MQTT 5.0 packet', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    decoder.push(Buffer.from([
      176, 25, // Header
      0, 8, // Message ID
      20, // properties length
      31, 0, 4, 116, 101, 115, 116, // reasonString
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
      0, 128 // success and error
    ]));
    const packet: PacketUnsuback = decoder.parse() as PacketUnsuback;
    expect(packet).toBeInstanceOf(PacketUnsuback);
    expect(packet.b).toBe(176);
    expect(packet.l).toBe(25);
    expect(packet.i).toBe(8);
    expect(packet.p).toEqual({
      [PROPERTY.ReasonString]: 'test',
      [PROPERTY.UserProperty]: [['test', 'test']],
    });
    expect(packet.s).toEqual([0, 128]);
  });

  it('parses MQTT 3.1.1 packet', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      176, 4, // Header
      0, 8, // Message ID
      0, 128 // success and error
    ]));
    const packet: PacketUnsuback = decoder.parse() as PacketUnsuback;
    expect(packet).toBeInstanceOf(PacketUnsuback);
    expect(packet.b).toBe(176);
    expect(packet.l).toBe(4);
    expect(packet.i).toBe(8);
    expect(packet.p).toEqual({});
    expect(packet.s).toEqual([0, 128]);
  });

  it('parses MQTT 3.1.0 packet', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      176, 2, // Header
      0, 8, // Message ID
    ]));
    const packet: PacketUnsuback = decoder.parse() as PacketUnsuback;
    expect(packet).toBeInstanceOf(PacketUnsuback);
    expect(packet.b).toBe(176);
    expect(packet.l).toBe(2);
    expect(packet.i).toBe(8);
    expect(packet.p).toEqual({});
    expect(packet.s).toEqual([]);
  });
});

describe('PINGREQ', () => {
  it('parses MQTT 5.0 packet', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    decoder.push(Buffer.from([
      192, 0 // Header
    ]));
    const packet: PacketPingreq = decoder.parse() as PacketPingreq;
    expect(packet).toBeInstanceOf(PacketPingreq);
    expect(packet.b).toBe(192);
    expect(packet.l).toBe(0);
  });

  it('parses MQTT 3.1.1 packet', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      192, 0 // Header
    ]));
    const packet: PacketPingreq = decoder.parse() as PacketPingreq;
    expect(packet).toBeInstanceOf(PacketPingreq);
    expect(packet.b).toBe(192);
    expect(packet.l).toBe(0);
  });
});

describe('PINGRESP', () => {
  it('parses in MQTT 5.0 mode', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    decoder.push(Buffer.from([
      208, 0 // Header
    ]));
    const packet: PacketPingresp = decoder.parse() as PacketPingresp;
    expect(packet).toBeInstanceOf(PacketPingresp);
    expect(packet.b).toBe(208);
    expect(packet.l).toBe(0);
  });

  it('parses in MQTT 3.1.1 mode', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      208, 0 // Header
    ]));
    const packet: PacketPingresp = decoder.parse() as PacketPingresp;
    expect(packet).toBeInstanceOf(PacketPingresp);
    expect(packet.b).toBe(208);
    expect(packet.l).toBe(0);
  });
});

describe('DISCONNECT', () => {
  it('parses MQTT 5.0 packet', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    decoder.push(Buffer.from([
      224, 34, // Header
      0, // reason code
      32, // properties length
      17, 0, 0, 0, 145, // sessionExpiryInterval
      31, 0, 4, 116, 101, 115, 116, // reasonString
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
      28, 0, 4, 116, 101, 115, 116// serverReference
    ]));
    const packet: PacketDisconnect = decoder.parse() as PacketDisconnect;
    expect(packet).toBeInstanceOf(PacketDisconnect);
    expect(packet.b).toBe(224);
    expect(packet.l).toBe(34);
    expect(packet.c).toBe(0);
    expect(packet.p).toEqual({
      [PROPERTY.SessionExpiryInterval]: 145,
      [PROPERTY.ReasonString]: 'test',
      [PROPERTY.ServerReference]: 'test',
      [PROPERTY.UserProperty]: [['test', 'test']],
    });
  });

  it('parses MQTT 3.1.1 packet', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      224, 0 // Header
    ]));
    const packet: PacketDisconnect = decoder.parse() as PacketDisconnect;
    expect(packet).toBeInstanceOf(PacketDisconnect);
    expect(packet.b).toBe(224);
    expect(packet.l).toBe(0);
  });
});

describe('AUTH', () => {
  it('parses MQTT 5.0 packet', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    decoder.push(Buffer.from([
      240, 36, // Header
      0, // reason code
      34, // properties length
      21, 0, 4, 116, 101, 115, 116, // auth method
      22, 0, 4, 0, 1, 2, 3, // auth data
      31, 0, 4, 116, 101, 115, 116, // reasonString
      38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116 // userProperties
    ]));
    const packet: PacketAuth = decoder.parse() as PacketAuth;
    expect(packet).toBeInstanceOf(PacketAuth);
    expect(packet.b).toBe(240);
    expect(packet.l).toBe(36);
    expect(packet.c).toBe(0);
    expect(packet.p).toEqual({
      [PROPERTY.AuthenticationMethod]: 'test',
      [PROPERTY.AuthenticationData]: Buffer.from([0, 1, 2, 3]),
      [PROPERTY.ReasonString]: 'test',
      [PROPERTY.UserProperty]: [['test', 'test']],
    });
  });
});

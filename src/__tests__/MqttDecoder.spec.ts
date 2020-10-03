import {MqttDecoder} from '../MqttDecoder';
import {connect, connectAck, connectWithClientId, publish3111, subscribe, subscribeAck} from './util';
import {PACKET_TYPE, PROPERTY} from '../enums';
import {PacketConnect} from '../packets/connect';
import {PacketConnack} from '../packets/connack';
import {PacketPublish} from '../packets/publish';

it('can instantiate', () => {
  const decoder = new MqttDecoder();
});

describe('CONNECT', () => {
  it('can parse CONNECT packet fixed header', () => {
    const decoder = new MqttDecoder();
    decoder.push(connect);
    const packet = decoder.parse();
    expect(packet!.l).toBe(connect.byteLength - 2);
    expect(packet!.type()).toBe(PACKET_TYPE.CONNECT);
    expect(packet!.dup()).toBe(false);
    expect(packet!.qos()).toBe(0);
    expect(packet!.retain()).toBe(false);
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
    expect(packet.v).toBe(3);
    expect(packet.f).toBe(246);
    expect(packet.k).toBe(30);
    expect(packet.id).toBe('test');
    expect(packet.wt).toBe('topic');
    expect(packet.w!.toString('utf8')).toBe('payload');
    expect(packet.usr).toBe('username');
    expect(packet.pwd!.toString('utf8')).toBe('password');
  });
});

describe('CONNACK', () => {
  it('can parse CONNACK packet fixed header', () => {
    const decoder = new MqttDecoder();
    decoder.push(connectAck);
    const packet = decoder.parse();
    expect(packet!.l).toBe(connectAck.byteLength - 2);
    expect(packet!.type()).toBe(PACKET_TYPE.CONNACK);
    expect(packet!.dup()).toBe(false);
    expect(packet!.qos()).toBe(0);
    expect(packet!.retain()).toBe(false);
  });

  it('parses variable header', () => {
    const decoder = new MqttDecoder();
    decoder.version = 5;
    decoder.push(connectAck);
    const packet: PacketConnack = decoder.parse() as PacketConnack;
    expect(packet.f).toBe(0);
    expect(packet.c).toBe(1);
    expect(packet.p).toEqual({
      [PROPERTY.TopicAliasMaximum]: 10,
      [PROPERTY.AssignedClientIdentifier]: 'auto-A685BAC0-7182-E166-242A-3FD8358C03C8',
    });
  });
});

describe('PUBLISH', () => {
  it('parses PUBLISH variable data', () => {
    const decoder = new MqttDecoder();
    decoder.push(publish3111);
    const packet: PacketPublish = decoder.parse() as PacketPublish;
    expect(packet.b).toBe(publish3111.readUInt8(0));
    expect(packet.l).toBe(publish3111.readUInt8(1));
    expect(packet.t).toBe('zibel32/18fe34f1d68e/$name');
    expect(packet.i).toBe(23145);
    expect(packet.p).toEqual({});
    expect(packet.d.toString()).toMatchInlineSnapshot(`"bel32 Garage Door"`);
  });
});

// it('can parse SUBACK packet fixed header', () => {
//   const decoder = new MqttDecoder();
//   decoder.push(subscribeAck);
//   const packet = decoder.parse();
//   expect(packet!.type()).toBe(PACKET_TYPE.SUBACK);
//   expect(packet!.dup()).toBe(false);
//   expect(packet!.qos()).toBe(0);
//   expect(packet!.retain()).toBe(false);
// });

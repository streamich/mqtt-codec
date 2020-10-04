import {MqttDecoder} from '../MqttDecoder';
import {connect, connectAck, connectWithClientId, publish3111, subscribe, subscribeAck} from './util';
import {PACKET_TYPE, PROPERTY} from '../enums';
import {PacketConnect} from '../packets/connect';
import {PacketConnack} from '../packets/connack';
import {PacketPublish} from '../packets/publish';
import {PacketPuback} from '../packets/puback';
import {PacketPubrec} from '../packets/pubrec';
import {PacketSubscribe} from '../packets/subscribe';
import { PacketSuback } from '../packets/suback';

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

describe('PUBACK', () => {
  it('parses 3.1.1 packet', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      64, 2, // Header
      0, 2 // Message ID
    ]));
    const packet: PacketPuback = decoder.parse() as PacketPuback;
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
    expect(packet.b).toBe(64);
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

describe('PUBREC', () => {
  it('parses MQTT 3.1.1 packet', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      80, 2, // Header
      0, 2 // Message ID
    ]));
    const packet: PacketPubrec = decoder.parse() as PacketPubrec;
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
    expect(packet.b).toBe(80);
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

describe('PUBREL', () => {
  it('parses MQTT 3.1.1 packet', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      98, 2, // Header
      0, 2 // Message ID
    ]));
    const packet: PacketPubrec = decoder.parse() as PacketPubrec;
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
    const packet: PacketPubrec = decoder.parse() as PacketPubrec;
    expect(packet.b).toBe(98);
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

describe('PUBCOMP', () => {
  it('parses MQTT 3.1.1 packet', () => {
    const decoder = new MqttDecoder();
    decoder.push(Buffer.from([
      112, 2, // Header
      0, 2 // Message ID
    ]));
    const packet: PacketPubrec = decoder.parse() as PacketPubrec;
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
    const packet: PacketPubrec = decoder.parse() as PacketPubrec;
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
    expect(packet.b).toBe(130);
    expect(packet.l).toBe(9);
    expect(packet.i).toBe(6);
    expect(packet.p).toEqual({});
    expect(packet.s).toMatchObject([
      {
        t: 'test',
        f: 0,
      }
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
    expect(packet.b).toBe(130);
    expect(packet.l).toBe(26);
    expect(packet.i).toBe(6);
    expect(packet.p).toEqual({
      [PROPERTY.SubscriptionIdentifier]: 145,
      [PROPERTY.UserProperty]: [
        ['test', 'test'],
      ],
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
    expect(packet).toMatchObject({
      b: 130,
      l: 40,
      i: 7,
      p: {
        [PROPERTY.SubscriptionIdentifier]: 145,
        [PROPERTY.UserProperty]: [
          ['test', 'test'],
        ],
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
    expect(packet.b).toBe(144);
    expect(packet.l).toBe(27);
    expect(packet.i).toBe(6);
    expect(packet.p).toEqual({
      [PROPERTY.ReasonString]: 'test',
      [PROPERTY.UserProperty]: [
        ['test', 'test'],
      ],
    });
    expect(packet.s).toEqual([0, 1, 2, 1]);
  });
});

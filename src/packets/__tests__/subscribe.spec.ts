import {PACKET_TYPE, PROPERTY} from '../../enums';
import {PacketSubscribe, Subscription} from '../subscribe';
import {MqttDecoder} from '../../MqttDecoder';

test('can create a packet', () => {
  const packet = PacketSubscribe.create(0, {});
  expect(packet.b >> 4).toBe(PACKET_TYPE.SUBSCRIBE);
  expect(packet.l).toBe(0);
  expect(packet.i).toBe(0);
  expect(packet.p).toEqual({});
  expect(packet.s).toEqual([]);
});

test('can add a subscription', () => {
  const packet = PacketSubscribe.create(0, {});
  expect(packet.s).toEqual([]);
  packet.addSubscription(Subscription.create('foo', 0, false, false, 0));
  expect(packet.s).toEqual([
    {t: 'foo', f: 0},
  ]);
  packet.addSubscription(Subscription.create('bar', 0, false, false, 0));
  expect(packet.s).toEqual([
    {t: 'foo', f: 0},
    {t: 'bar', f: 0},
  ]);
});

test('can serialize basic packet MQTT 5.0', () => {
  const packet = PacketSubscribe.create(0, {});
  packet.addSubscription(Subscription.create('topic', 0, false, false, 0));
  expect(packet instanceof PacketSubscribe).toBe(true);
  const buf = packet.toBuffer(5);
  expect(buf).toEqual(Buffer.from([
    0x80,                         // Header
    0x0b,                         // Remaining length
    0x00, 0x00,                   // Packet Identifier
    0x00,                         // Properties
    0x00, 0x05,                   // "topic" length
    0x74, 0x6f, 0x70, 0x69, 0x63, // "topic"
    0x00,                         // Subscription flags
  ]));
});

test('can serialize basic packet MQTT 3.1.1', () => {
  const packet = PacketSubscribe.create(0, {});
  packet.addSubscription(Subscription.create('topic', 0, false, false, 0));
  expect(packet instanceof PacketSubscribe).toBe(true);
  const buf = packet.toBuffer(4);
  expect(buf).toEqual(Buffer.from([
    0x80,                         // Header
    0x0a,                         // Remaining length
    0x00, 0x00,                   // Packet Identifier
    0x00, 0x05,                   // "topic" length
    0x74, 0x6f, 0x70, 0x69, 0x63, // "topic"
    0x00,                         // Subscription flags
  ]));
});

test('can serialize a packet with two subscriptions', () => {
  const packet = PacketSubscribe.create(0, {});
  packet.addSubscription(Subscription.create('topic', 0, false, false, 0));
  packet.addSubscription(Subscription.create('topid', 1, true, true, 1));
  expect(packet instanceof PacketSubscribe).toBe(true);
  const buf = packet.toBuffer(5);
  expect(buf).toEqual(Buffer.from([
    0x80,                         // Header
    0x13,                         // Remaining length
    0x00, 0x00,                   // Packet Identifier
    0x00,                         // Properties
    0x00, 0x05,                   // "topic" length
    0x74, 0x6f, 0x70, 0x69, 0x63, // "topic"
    0x00,                         // Subscription flags
    0x00, 0x05,                   // "topid" length
    0x74, 0x6f, 0x70, 0x69, 0x64, // "topid"
    0x1d,                         // Subscription flags
  ]));
});

test('can serialize packet and deserialize it back', () => {
  const packet1 = PacketSubscribe.create(1, {});
  packet1.addSubscription(Subscription.create('a', 0, true, true, 0));
  packet1.addSubscription(Subscription.create('b', 1, false, true, 2));
  packet1.addSubscription(Subscription.create('c', 2, true, false, 1));
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(packet1.toBuffer(5));
  const packet2 = decoder.parse()! as PacketSubscribe;
  expect(packet2).toEqual(packet1);
  expect(packet2.i).toEqual(1);
  expect(packet2.p).toEqual({});
  expect(packet2.s.length).toEqual(3);
  expect(packet2.s[1].noLocal()).toBe(false);
});

test('can serialize packet and deserialize it with props', () => {
  const packet1 = PacketSubscribe.create(1, {
    [PROPERTY.MaximumPacketSize]: 123,
  });
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(packet1.toBuffer(5));
  const packet2 = decoder.parse()! as PacketSubscribe;
  expect(packet2).toEqual(packet1);
  expect(packet2.p).toEqual({
    [PROPERTY.MaximumPacketSize]: 123,
  });
});

describe('Subscription', () => {
  test('can create a subscription', () => {
    const sub = Subscription.create('topic', 0, false, false, 0);
    expect(sub.t).toBe('topic');
    expect(sub.f).toBe(0);
    expect(sub.qualityOfService()).toBe(0);
    expect(sub.noLocal()).toBe(false);
    expect(sub.retainAsPublished()).toBe(false);
    expect(sub.retainHandling()).toBe(0);
  });

  test('can set QoS', () => {
    const sub1 = Subscription.create('topic', 0, false, false, 0);
    expect(sub1.qualityOfService()).toBe(0);
    const sub2 = Subscription.create('topic', 1, false, false, 0);
    expect(sub2.qualityOfService()).toBe(1);
    const sub3 = Subscription.create('topic', 2, false, false, 0);
    expect(sub3.qualityOfService()).toBe(2);
  });

  test('can set noLocal', () => {
    const sub1 = Subscription.create('topic', 0, false, false, 0);
    expect(sub1.noLocal()).toBe(false);
    const sub2 = Subscription.create('topic', 0, true, false, 0);
    expect(sub2.noLocal()).toBe(true);
  });

  test('can set retainAsPublished', () => {
    const sub1 = Subscription.create('topic', 0, false, true, 0);
    expect(sub1.retainAsPublished()).toBe(true);
    const sub2 = Subscription.create('topic', 0, true, false, 0);
    expect(sub2.retainAsPublished()).toBe(false);
  });

  test('can set retainHandling', () => {
    const sub1 = Subscription.create('topic', 0, false, false, 0);
    expect(sub1.retainHandling()).toBe(0);
    const sub2 = Subscription.create('topic', 0, false, false, 1);
    expect(sub2.retainHandling()).toBe(1);
    const sub3 = Subscription.create('topic', 0, false, false, 2);
    expect(sub3.retainHandling()).toBe(2);
  });
});

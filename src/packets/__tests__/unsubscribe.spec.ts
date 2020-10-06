import {PACKET_TYPE, PROPERTY} from '../../enums';
import {PacketUnsubscribe} from '../unsubscribe';
import {MqttDecoder} from '../../MqttDecoder';

test('can create a packet', () => {
  const packet = PacketUnsubscribe.create(1234, {}, ['aha/123']);
  expect(packet.b >> 4).toBe(PACKET_TYPE.UNSUBSCRIBE);
  expect(packet.i).toBe(1234);
  expect(packet.p).toEqual({});
  expect(packet.s).toEqual(['aha/123']);
});

test('can serialize basic packet MQTT 5.0', () => {
  const packet = PacketUnsubscribe.create(1234, {}, ['abc', 'def']);
  expect(packet instanceof PacketUnsubscribe).toBe(true);
  const buf = packet.toBuffer(5);
  expect(buf).toEqual(Buffer.from([
    PACKET_TYPE.UNSUBSCRIBE << 4,   // Header
    0x0d,   // Remaining length
    0x04, 0xd2, // Packet Identifier
    0x00, // Properties
    0x00, 0x03, // "abc" length
    0x61, 0x62, 0x63, // "abc"
    0x00, 0x03, // "def" length
    0x64, 0x65, 0x66, // "abc"
  ]));
});

test('can serialize basic packet MQTT 3.1.1', () => {
  const packet = PacketUnsubscribe.create(1234, {}, ['abc', 'def']);
  expect(packet instanceof PacketUnsubscribe).toBe(true);
  const buf = packet.toBuffer(4);
  expect(buf).toEqual(Buffer.from([
    PACKET_TYPE.UNSUBSCRIBE << 4,   // Header
    0x0c,   // Remaining length
    0x04, 0xd2, // Packet Identifier
    0x00, 0x03, // "abc" length
    0x61, 0x62, 0x63, // "abc"
    0x00, 0x03, // "def" length
    0x64, 0x65, 0x66, // "abc"
  ]));
});

test('can serialize packet and deserialize it back with props', () => {
  const packet1 = PacketUnsubscribe.create(1234, {
    [PROPERTY.UserProperty]: ['test', 'test'],
  }, ['abc', 'def']);
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(packet1.toBuffer(5));
  const packet2 = decoder.parse()! as PacketUnsubscribe;
  expect(packet2).toEqual(packet1);
  expect(packet2.i).toEqual(1234);
  expect(packet2.p).toEqual({
    [PROPERTY.UserProperty]: ['test', 'test'],
  });
});

test('can serialize packet and deserialize it back without props', () => {
  const packet1 = PacketUnsubscribe.create(666, {}, ['a']);
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(packet1.toBuffer(5));
  const packet2 = decoder.parse()! as PacketUnsubscribe;
  expect(packet2).toEqual(packet1);
  expect(packet2.i).toEqual(666);
  expect(packet2.p).toEqual({});
  expect(packet2.s).toEqual(['a']);
});

test('can serialize packet and deserialize it back MQTT 3.1.1', () => {
  const packet1 = PacketUnsubscribe.create(666, {
    [PROPERTY.UserProperty]: ['test', 'test'],
  }, ['a']);
  const decoder = new MqttDecoder();
  decoder.version = 4;
  decoder.push(packet1.toBuffer(4));
  const packet2 = decoder.parse()! as PacketUnsubscribe;
  expect(packet2.i).toEqual(666);
  expect(packet2.p).toEqual({});
  expect(packet2.s).toEqual(['a']);
});

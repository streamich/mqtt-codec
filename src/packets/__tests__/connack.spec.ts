import {PACKET_TYPE} from '../../enums';
import {PacketConnack} from '../connack';
import {MqttDecoder} from '../../MqttDecoder';

test('can create a packet', () => {
  const packet = PacketConnack.create(0, {});
  expect(packet.b >> 4).toBe(PACKET_TYPE.CONNACK);
  expect(packet.l).toBe(0);
  expect(packet.f).toBe(0);
  expect(packet.c).toBe(0);
  expect(packet.p).toEqual({});
});

test('can change Session Present flag', () => {
  const packet = PacketConnack.create(0, {});
  expect(packet.sessionPresent()).toBe(false);
  packet.setSessionPresent(false);
  expect(packet.sessionPresent()).toBe(false);
  packet.setSessionPresent(true);
  expect(packet.sessionPresent()).toBe(true);
  packet.setSessionPresent(true);
  expect(packet.sessionPresent()).toBe(true);
  packet.setSessionPresent(false);
  expect(packet.sessionPresent()).toBe(false);
});

test('can serialize basic packet MQTT 5.0', () => {
  const packet = PacketConnack.create(0, {});
  expect(packet instanceof PacketConnack).toBe(true);
  const buf = packet.toBuffer(5);
  expect(buf).toEqual(Buffer.from([
    0x20,   // Header
    0x03,   // Remaining length
    0x00,   // Flags
    0x00,   // Reason code
    0x00    // Properties
  ]));
});

test('can serialize basic packet MQTT 3.1.1', () => {
  const packet = PacketConnack.create(0, {});
  expect(packet instanceof PacketConnack).toBe(true);
  const buf = packet.toBuffer(4);
  expect(buf).toEqual(Buffer.from([
    0x20,   // Header
    0x02,   // Remaining length
    0x00,   // Flags
    0x00,   // Reason code
  ]));
});

test('can serialize packet and deserialize it back', () => {
  const packet1 = PacketConnack.create(1, {});
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(packet1.toBuffer(5));
  const packet2 = decoder.parse()! as PacketConnack;
  expect(packet2).toEqual(packet1);
  expect(packet2.p).toEqual({});
  expect(packet2.c).toEqual(1);
  expect(packet2.sessionPresent()).toBe(false);
});

test('can serialize packet and deserialize it back with a flag', () => {
  const packet1 = PacketConnack.create(2, {});
  packet1.setSessionPresent(true);
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(packet1.toBuffer(5));
  const packet2 = decoder.parse()! as PacketConnack;
  expect(packet2).toEqual(packet1);
  expect(packet2.sessionPresent()).toBe(true);
});

import {PACKET_TYPE, PROPERTY} from '../../enums';
import {PacketUnsuback} from '../unsuback';
import {MqttDecoder} from '../../MqttDecoder';

test('can create a packet', () => {
  const packet = PacketUnsuback.create(0, {}, [1]);
  expect(packet.b >> 4).toBe(PACKET_TYPE.UNSUBACK);
  expect(packet.l).toBe(0);
  expect(packet.i).toBe(0);
  expect(packet.p).toEqual({});
  expect(packet.s).toEqual([1]);
});

test('can serialize basic packet MQTT 5.0', () => {
  const packet = PacketUnsuback.create(0, {}, [0, 1, 2]);
  expect(packet instanceof PacketUnsuback).toBe(true);
  const buf = packet.toBuffer(5);
  expect(buf).toEqual(Buffer.from([
    PACKET_TYPE.UNSUBACK << 4,    // Header
    0x06,                         // Remaining length
    0x00, 0x00,                   // Packet Identifier
    0x00,                         // Properties
    0,                            // Reason Code
    1,                            // Reason Code
    2,                            // Reason Code
  ]));
});

test('can serialize basic packet MQTT 3.1.1', () => {
  const packet = PacketUnsuback.create(0, {}, [0, 1, 2]);
  expect(packet instanceof PacketUnsuback).toBe(true);
  const buf = packet.toBuffer(4);
  expect(buf).toEqual(Buffer.from([
    PACKET_TYPE.UNSUBACK << 4,    // Header
    0x05,                         // Remaining length
    0x00, 0x00,                   // Packet Identifier
    0,                            // Reason Code
    1,                            // Reason Code
    2,                            // Reason Code
  ]));
});

test('can serialize packet and deserialize it back', () => {
  const packet1 = PacketUnsuback.create(0, {}, [0, 1, 2]);
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(packet1.toBuffer(5));
  const packet2 = decoder.parse()! as PacketUnsuback;
  expect(packet2).toEqual(packet1);
  expect(packet2.s).toEqual([0, 1, 2]);
});

test('can serialize packet and deserialize it with props', () => {
  const packet1 = PacketUnsuback.create(0, {
    [PROPERTY.MaximumPacketSize]: 123,
  }, [1]);
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(packet1.toBuffer(5));
  const packet2 = decoder.parse()! as PacketUnsuback;
  expect(packet2).toEqual(packet1);
  expect(packet2.p).toEqual({
    [PROPERTY.MaximumPacketSize]: 123,
  });
});

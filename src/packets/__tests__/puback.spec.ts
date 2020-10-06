import {PACKET_TYPE, PROPERTY} from '../../enums';
import {PacketPuback} from '../puback';
import {MqttDecoder} from '../../MqttDecoder';

test('can create a packet', () => {
  const packet = PacketPuback.create(0, 0, {});
  expect(packet.b >> 4).toBe(PACKET_TYPE.PUBACK);
  expect(packet.l).toBe(0);
  expect(packet.i).toBe(0);
  expect(packet.c).toBe(0);
  expect(packet.p).toEqual({});
});

test('can serialize basic packet MQTT 5.0', () => {
  const packet = PacketPuback.create(0, 0, {});
  expect(packet instanceof PacketPuback).toBe(true);
  const buf = packet.toBuffer(5);
  expect(buf).toEqual(Buffer.from([
    0x40,           // Header
    0x04,           // Remaining length
    0x00, 0x00,     // Packet Identifier
    0x00,           // Reason code
    0x00            // Properties
  ]));
});

test('can serialize basic packet MQTT 3.1.1', () => {
  const packet = PacketPuback.create(0, 0, {});
  expect(packet instanceof PacketPuback).toBe(true);
  const buf = packet.toBuffer(3);
  expect(buf).toEqual(Buffer.from([
    0x40,           // Header
    0x02,           // Remaining length
    0x00, 0x00,     // Packet Identifier
  ]));
});

test('can serialize packet and deserialize it back', () => {
  const packet1 = PacketPuback.create(1, 2, {});
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(packet1.toBuffer(5));
  const packet2 = decoder.parse()! as PacketPuback;
  expect(packet2).toEqual(packet1);
  expect(packet2.i).toEqual(1);
  expect(packet2.c).toEqual(2);
  expect(packet2.p).toEqual({});
});

test('can serialize packet and deserialize it with props', () => {
  const packet1 = PacketPuback.create(1, 2, {
    [PROPERTY.UserProperty]: [
      'a', 'b',
    ],
  });
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(packet1.toBuffer(5));
  const packet2 = decoder.parse()! as PacketPuback;
  expect(packet2).toEqual(packet1);
  expect(packet2.i).toEqual(1);
  expect(packet2.c).toEqual(2);
  expect(packet2.p).toEqual({
    [PROPERTY.UserProperty]: [
      'a', 'b',
    ],
  });
});

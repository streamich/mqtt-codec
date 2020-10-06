import {PACKET_TYPE, PROPERTY} from '../../enums';
import {PacketDisconnect} from '../disconnect';
import {MqttDecoder} from '../../MqttDecoder';

test('can create a packet', () => {
  const packet = PacketDisconnect.create(12, {});
  expect(packet.b >> 4).toBe(PACKET_TYPE.DISCONNECT);
  expect(packet.l).toBe(0);
  expect(packet.c).toBe(12);
  expect(packet.p).toEqual({});
});

test('can serialize basic packet MQTT 5.0', () => {
  const packet = PacketDisconnect.create(3, {});
  expect(packet instanceof PacketDisconnect).toBe(true);
  const buf = packet.toBuffer(5);
  expect(buf).toEqual(Buffer.from([
    PACKET_TYPE.DISCONNECT << 4,   // Header
    0x01,   // Remaining length
    0x03,   // Reason code
  ]));
});

test('can serialize basic packet MQTT 3.1.1', () => {
  const packet = PacketDisconnect.create(3, {});
  expect(packet instanceof PacketDisconnect).toBe(true);
  const buf = packet.toBuffer(4);
  expect(buf).toEqual(Buffer.from([
    PACKET_TYPE.DISCONNECT << 4,   // Header
    0x00,   // Remaining length
  ]));
});

test('can serialize packet and deserialize it back with props', () => {
  const packet1 = PacketDisconnect.create(1, {
    [PROPERTY.UserProperty]: ['test', 'test'],
  });
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(packet1.toBuffer(5));
  const packet2 = decoder.parse()! as PacketDisconnect;
  expect(packet2).toEqual(packet1);
  expect(packet2.c).toEqual(1);
  expect(packet2.p).toEqual({
    [PROPERTY.UserProperty]: ['test', 'test'],
  });
});

test('can serialize packet and deserialize it back without props', () => {
  const packet1 = PacketDisconnect.create(5, {});
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(packet1.toBuffer(5));
  const packet2 = decoder.parse()! as PacketDisconnect;
  expect(packet2).toEqual(packet1);
  expect(packet2.c).toEqual(5);
  expect(packet2.p).toEqual({});
});

test('can serialize packet and deserialize it back MQTT 3.1.1', () => {
  const packet1 = PacketDisconnect.create(3, {});
  const decoder = new MqttDecoder();
  decoder.version = 4;
  decoder.push(packet1.toBuffer(4));
  const packet2 = decoder.parse()! as PacketDisconnect;
  expect(packet2.c).toEqual(0);
  expect(packet2.p).toEqual({});
});

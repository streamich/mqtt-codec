import {PACKET_TYPE, PROPERTY} from '../../enums';
import {PacketSuback} from '../suback';
import {MqttDecoder} from '../../MqttDecoder';

test('can create a packet', () => {
  const packet = PacketSuback.create(0, {}, [1]);
  expect(packet.b >> 4).toBe(PACKET_TYPE.SUBACK);
  expect(packet.l).toBe(0);
  expect(packet.i).toBe(0);
  expect(packet.p).toEqual({});
  expect(packet.s).toEqual([1]);
});

test('can serialize basic packet MQTT 5.0', () => {
  const packet = PacketSuback.create(0, {}, [0, 1, 2]);
  expect(packet instanceof PacketSuback).toBe(true);
  const buf = packet.toBuffer(5);
  expect(buf).toEqual(Buffer.from([
    0x90,                         // Header
    0x06,                         // Remaining length
    0x00, 0x00,                   // Packet Identifier
    0x00,                         // Properties
    0,                            // Reason Code
    1,                            // Reason Code
    2,                            // Reason Code
  ]));
});

test('can serialize basic packet MQTT 3.1.1', () => {
  const packet = PacketSuback.create(0, {}, [0, 1, 2]);
  expect(packet instanceof PacketSuback).toBe(true);
  const buf = packet.toBuffer(4);
  expect(buf).toEqual(Buffer.from([
    0x90,                         // Header
    0x05,                         // Remaining length
    0x00, 0x00,                   // Packet Identifier
    0,                            // Reason Code
    1,                            // Reason Code
    2,                            // Reason Code
  ]));
});

test('can serialize packet and deserialize it back', () => {
  const packet1 = PacketSuback.create(0, {}, [0, 1, 2]);
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(packet1.toBuffer(5));
  const packet2 = decoder.parse()! as PacketSuback;
  expect(packet2).toEqual(packet1);
  expect(packet2.s).toEqual([0, 1, 2]);
});

test('can serialize packet and deserialize it with props', () => {
  const packet1 = PacketSuback.create(0, {
    [PROPERTY.MaximumPacketSize]: 123,
  }, [1]);
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(packet1.toBuffer(5));
  const packet2 = decoder.parse()! as PacketSuback;
  expect(packet2).toEqual(packet1);
  expect(packet2.p).toEqual({
    [PROPERTY.MaximumPacketSize]: 123,
  });
});

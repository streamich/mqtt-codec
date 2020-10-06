import {PACKET_TYPE, PROPERTY} from '../../enums';
import {PacketAuth} from '../auth';
import {MqttDecoder} from '../../MqttDecoder';

test('can create a packet', () => {
  const packet = PacketAuth.create(12, {});
  expect(packet.b >> 4).toBe(PACKET_TYPE.AUTH);
  expect(packet.l).toBe(0);
  expect(packet.c).toBe(12);
  expect(packet.p).toEqual({});
});

test('can serialize basic packet MQTT 5.0', () => {
  const packet = PacketAuth.create(3, {});
  expect(packet instanceof PacketAuth).toBe(true);
  const buf = packet.toBuffer();
  expect(buf).toEqual(Buffer.from([
    PACKET_TYPE.AUTH << 4,   // Header
    0x01,   // Remaining length
    0x03,   // Reason code
  ]));
});

test('can serialize packet and deserialize it back with props', () => {
  const packet1 = PacketAuth.create(1, {
    [PROPERTY.UserProperty]: ['test', 'test'],
  });
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(packet1.toBuffer());
  const packet2 = decoder.parse()! as PacketAuth;
  expect(packet2).toEqual(packet1);
  expect(packet2.c).toEqual(1);
  expect(packet2.p).toEqual({
    [PROPERTY.UserProperty]: ['test', 'test'],
  });
});

test('can serialize packet and deserialize it back without props', () => {
  const packet1 = PacketAuth.create(5, {});
  const decoder = new MqttDecoder();
  decoder.version = 5;
  const buf = packet1.toBuffer();
  decoder.push(buf);
  const packet2 = decoder.parse()! as PacketAuth;
  expect(packet2).toEqual(packet1);
  expect(packet2.c).toEqual(5);
  expect(packet2.p).toEqual({});
});

import {PACKET_TYPE} from '../../enums';
import {PacketPingresp, PINGRESP} from '../pingresp';
import {MqttDecoder} from '../../MqttDecoder';

test('can create a packet', () => {
  const packet = PacketPingresp.create();
  expect(packet.b >> 4).toBe(PACKET_TYPE.PINGRESP);
});

test('can serialize packet and deserialize it back', () => {
  const packet1 = PacketPingresp.create();
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(packet1.toBuffer());
  const packet2 = decoder.parse()! as PacketPingresp;
  expect(packet2).toBeInstanceOf(PacketPingresp);
});

test('can parse static packet buffer', () => {
  const decoder = new MqttDecoder();
  decoder.push(PINGRESP);
  const packet2 = decoder.parse()! as PacketPingresp;
  expect(packet2).toBeInstanceOf(PacketPingresp);
});

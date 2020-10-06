import {PACKET_TYPE} from '../../enums';
import {PacketPingreq, PINGREQ} from '../pingreq';
import {MqttDecoder} from '../../MqttDecoder';

test('can create a packet', () => {
  const packet = PacketPingreq.create();
  expect(packet.b >> 4).toBe(PACKET_TYPE.PINGREQ);
});

test('can serialize packet and deserialize it back', () => {
  const packet1 = PacketPingreq.create();
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(packet1.toBuffer());
  const packet2 = decoder.parse()! as PacketPingreq;
  expect(packet2).toBeInstanceOf(PacketPingreq);
});

test('can parse static packet buffer', () => {
  const decoder = new MqttDecoder();
  decoder.push(PINGREQ);
  const packet2 = decoder.parse()! as PacketPingreq;
  expect(packet2).toBeInstanceOf(PacketPingreq);
});

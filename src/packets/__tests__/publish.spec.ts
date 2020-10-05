import {PACKET_TYPE, PROPERTY} from '../../enums';
import {PacketPublish} from '../publish';
import {MqttDecoder} from '../../MqttDecoder';

test('can create a packet', () => {
  const packet = PacketPublish.create('topic', 0, {}, Buffer.from([1, 2, 3]));
  expect(packet.b >> 4).toBe(PACKET_TYPE.PUBLISH);
  expect(packet.t).toBe('topic');
  expect(packet.i).toBe(0);
  expect(packet.p).toEqual({});
  expect(packet.d).toEqual(Buffer.from([1, 2, 3]));
});

test('can serialize a basic packet', () => {
  const packet1 = PacketPublish.create('topic', 0, {}, Buffer.from([1, 2, 3]));
  const buf = packet1.toBuffer(5);
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(buf);
  const packet2 = decoder.parse()! as PacketPublish;
  expect(packet2.b).toBe(packet1.b);
  expect(packet2.t).toBe('topic');
  expect(packet2.p).toEqual({});
  expect(packet2.d).toEqual(Buffer.from([1, 2, 3]));
  expect(packet2).toEqual(packet1);
});

test('can encode packet with QoS = 1', () => {
  const packet1 = PacketPublish.create('topic', 1, {}, Buffer.from([1, 2, 3]));
  packet1.setQualityOfService(1);
  const buf = packet1.toBuffer(5);
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(buf);
  const packet2 = decoder.parse()! as PacketPublish;
  expect(packet2.b).toBe(packet1.b);
  expect(packet2.qualityOfService()).toBe(1);
  expect(packet2.t).toBe('topic');
  expect(packet2.p).toEqual({});
  expect(packet2.d).toEqual(Buffer.from([1, 2, 3]));
  expect(packet2).toEqual(packet1);
});

test('can encode properties', () => {
  const packet1 = PacketPublish.create('topic', 1, {
    [PROPERTY.AssignedClientIdentifier]: 'test',
    [PROPERTY.UserProperty]: [
      ['test', 'test'],
    ],
  }, Buffer.from([1, 2, 3]));
  packet1.setQualityOfService(1);
  const buf = packet1.toBuffer(5);
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(buf);
  const packet2 = decoder.parse()! as PacketPublish;
  expect(packet2.b).toBe(packet1.b);
  expect(packet2.qualityOfService()).toBe(1);
  expect(packet2.t).toBe('topic');
  expect(packet2.p).toEqual({
    [PROPERTY.AssignedClientIdentifier]: 'test',
    [PROPERTY.UserProperty]: [
      ['test', 'test'],
    ],
  });
  expect(packet2.d).toEqual(Buffer.from([1, 2, 3]));
  expect(packet2).toEqual(packet1);
});

import {PacketPublish} from '../..';
import {PROPERTY} from '../../../../../es6/enums';
import {MqttDecoder} from '../../../../MqttDecoder';
import {encodePublish as v1} from '../v1';
import {encodePublish as v2} from '../v2';
import {encodePublish as v3} from '../v3';

const generators = [v1, v2, v3];

for (let i = 0; i < generators.length; i++) {
  const encodePublish = generators[i];
  describe(`encodePublish v${i + 1}`, () => {
    test('can serialize a basic packet', () => {
      const packet1 = PacketPublish.create('topic', 0, {}, Buffer.from([1, 2, 3]));
      const buf = encodePublish(packet1, 5);
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
      const buf = encodePublish(packet1, 5);
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
      const buf = encodePublish(packet1, 5);
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
  });
}

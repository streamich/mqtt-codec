import {PROPERTY} from '../../../es6/enums';
import {PACKET_TYPE} from '../../enums';
import {PacketConnect} from '../connect';
import {MqttDecoder} from '../../MqttDecoder';

test('can create a packet', () => {
  const packet = PacketConnect.create(5, 30, {}, 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
  expect(packet.b >> 4).toBe(PACKET_TYPE.CONNECT);
  expect(packet.id).toBe('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
  expect(packet.v).toBe(5);
  expect(packet.f).toBe(0);
  expect(packet.k).toBe(30);
  expect(packet.p).toEqual({});
});

test('can set username', () => {
  const packet = PacketConnect.create(5, 30, {}, 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
  expect(packet.userNameFlag()).toBe(false);
  expect(packet.usr).toBe(undefined);
  packet.setUserName('streamich');
  expect(packet.userNameFlag()).toBe(true);
  expect(packet.usr).toBe('streamich');
  packet.setUserName('lol');
  expect(packet.userNameFlag()).toBe(true);
  expect(packet.usr).toBe('lol');
  packet.setUserName('');
  expect(packet.userNameFlag()).toBe(true);
  expect(packet.usr).toBe('');
});

test('can remove username', () => {
  const packet = PacketConnect.create(5, 30, {}, 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
  expect(packet.userNameFlag()).toBe(false);
  expect(packet.usr).toBe(undefined);
  packet.removeUserName();
  expect(packet.userNameFlag()).toBe(false);
  expect(packet.usr).toBe(undefined);
  packet.setUserName('streamich');
  expect(packet.userNameFlag()).toBe(true);
  expect(packet.usr).toBe('streamich');
  packet.removeUserName();
  expect(packet.userNameFlag()).toBe(false);
  expect(packet.usr).toBe(undefined);
});

test('can set password', () => {
  const packet = PacketConnect.create(5, 30, {}, 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
  expect(packet.passwordFlag()).toBe(false);
  expect(packet.usr).toBe(undefined);
  packet.setPassword(Buffer.from([1, 2, 3]));
  expect(packet.passwordFlag()).toBe(true);
  expect(packet.pwd).toEqual(Buffer.from([1, 2, 3]));
  packet.setPassword(Buffer.from([0, 0, 0]));
  expect(packet.passwordFlag()).toBe(true);
  expect(packet.pwd).toEqual(Buffer.from([0, 0, 0]));
  packet.setPassword(Buffer.from([]));
  expect(packet.passwordFlag()).toBe(true);
  expect(packet.pwd).toEqual(Buffer.from([]));
});

test('can remove password', () => {
  const packet = PacketConnect.create(5, 30, {}, 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
  expect(packet.passwordFlag()).toBe(false);
  expect(packet.pwd).toBe(undefined);
  packet.removePassword();
  expect(packet.passwordFlag()).toBe(false);
  expect(packet.pwd).toBe(undefined);
  packet.setPassword(Buffer.from([0, 0, 0]));
  expect(packet.passwordFlag()).toBe(true);
  expect(packet.pwd).toEqual(Buffer.from([0, 0, 0]));
  packet.removePassword();
  expect(packet.passwordFlag()).toBe(false);
  expect(packet.pwd).toBe(undefined);
});

test('can change Clean Start flag', () => {
  const packet = PacketConnect.create(5, 30, {}, 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
  expect(packet.cleanStart()).toBe(false);
  packet.setCleanStart(false);
  expect(packet.cleanStart()).toBe(false);
  packet.setCleanStart(true);
  expect(packet.cleanStart()).toBe(true);
  packet.setCleanStart(true);
  expect(packet.cleanStart()).toBe(true);
  packet.setCleanStart(false);
  expect(packet.cleanStart()).toBe(false);
});

test('can set will', () => {
  const packet = PacketConnect.create(5, 30, {}, 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
  expect(packet.willFlag()).toBe(false);
  expect(packet.willQos()).toBe(0);
  expect(packet.willRetain()).toBe(false);
  expect(packet.w).toBe(undefined);
  expect(packet.wt).toBe(undefined);
  expect(packet.wp).toBe(undefined);
  packet.setWill(Buffer.from([1, 2]), 'topic', {[PROPERTY.ContentType]: 'json'}, 2, true);
  expect(packet.willFlag()).toBe(true);
  expect(packet.willQos()).toBe(2);
  expect(packet.willRetain()).toBe(true);
  expect(packet.w).toEqual(Buffer.from([1, 2]));
  expect(packet.wt).toBe('topic');
  expect(packet.wp).toEqual({[PROPERTY.ContentType]: 'json'});
  packet.setWill(Buffer.from([0]), 'test', {}, 1, false);
  expect(packet.willFlag()).toBe(true);
  expect(packet.willQos()).toBe(1);
  expect(packet.willRetain()).toBe(false);
  expect(packet.w).toEqual(Buffer.from([0]));
  expect(packet.wt).toBe('test');
  expect(packet.wp).toEqual({});
});

test('can remove will', () => {
  const packet = PacketConnect.create(5, 30, {}, 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
  packet.removeWill();
  expect(packet.willFlag()).toBe(false);
  expect(packet.willQos()).toBe(0);
  expect(packet.willRetain()).toBe(false);
  expect(packet.w).toBe(undefined);
  expect(packet.wt).toBe(undefined);
  expect(packet.wp).toBe(undefined);
  packet.setWill(Buffer.from([1, 2]), 'topic', {[PROPERTY.ContentType]: 'json'}, 2, true);
  expect(packet.willFlag()).toBe(true);
  expect(packet.willQos()).toBe(2);
  expect(packet.willRetain()).toBe(true);
  expect(packet.w).toEqual(Buffer.from([1, 2]));
  expect(packet.wt).toBe('topic');
  expect(packet.wp).toEqual({[PROPERTY.ContentType]: 'json'});
  packet.removeWill();
  expect(packet.willFlag()).toBe(false);
  expect(packet.willQos()).toBe(0);
  expect(packet.willRetain()).toBe(false);
  expect(packet.w).toBe(undefined);
  expect(packet.wt).toBe(undefined);
  expect(packet.wp).toBe(undefined);
  packet.removeWill();
  expect(packet.willFlag()).toBe(false);
  expect(packet.willQos()).toBe(0);
  expect(packet.willRetain()).toBe(false);
  expect(packet.w).toBe(undefined);
  expect(packet.wt).toBe(undefined);
  expect(packet.wp).toBe(undefined);
});

test('can manipulate multiple properties simultaneously', () => {
  const packet = PacketConnect.create(5, 30, {}, 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');

  expect(packet.qualityOfService()).toBe(0);
  packet.setQualityOfService(2);
  expect(packet.qualityOfService()).toBe(2);

  expect(packet.usr).toBe(undefined);
  packet.setUserName('foo');
  expect(packet.qualityOfService()).toBe(2);
  expect(packet.usr).toBe('foo');

  expect(packet.pwd).toBe(undefined);
  packet.setPassword(Buffer.from([1, 2]));
  expect(packet.pwd).toEqual(Buffer.from([1, 2]));
  expect(packet.qualityOfService()).toBe(2);
  expect(packet.usr).toBe('foo');

  expect(packet.cleanStart()).toBe(false);
  packet.setCleanStart(true);
  expect(packet.cleanStart()).toBe(true);
  expect(packet.pwd).toEqual(Buffer.from([1, 2]));
  expect(packet.qualityOfService()).toBe(2);
  expect(packet.usr).toBe('foo');

  expect(packet.willFlag()).toBe(false);
  expect(packet.willRetain()).toBe(false);
  expect(packet.willQos()).toBe(0);
  packet.setWill(Buffer.from([25]), 't', {}, 0, false);
  expect(packet.willFlag()).toBe(true);
  expect(packet.willRetain()).toBe(false);
  expect(packet.willQos()).toBe(0);
  expect(packet.cleanStart()).toBe(true);
  expect(packet.pwd).toEqual(Buffer.from([1, 2]));
  expect(packet.qualityOfService()).toBe(2);
  expect(packet.usr).toBe('foo');

  packet.removePassword();
  expect(packet.willFlag()).toBe(true);
  expect(packet.willRetain()).toBe(false);
  expect(packet.willQos()).toBe(0);
  expect(packet.cleanStart()).toBe(true);
  expect(packet.pwd).toBe(undefined);
  expect(packet.qualityOfService()).toBe(2);
  expect(packet.usr).toBe('foo');

  packet.removeUserName();
  expect(packet.willFlag()).toBe(true);
  expect(packet.willRetain()).toBe(false);
  expect(packet.willQos()).toBe(0);
  expect(packet.cleanStart()).toBe(true);
  expect(packet.pwd).toBe(undefined);
  expect(packet.qualityOfService()).toBe(2);
  expect(packet.usr).toBe(undefined);

  packet.removeWill()
  expect(packet.willFlag()).toBe(false);
  expect(packet.willRetain()).toBe(false);
  expect(packet.willQos()).toBe(0);
  expect(packet.cleanStart()).toBe(true);
  expect(packet.pwd).toBe(undefined);
  expect(packet.qualityOfService()).toBe(2);
  expect(packet.usr).toBe(undefined);

  packet.setCleanStart(false);
  expect(packet.willFlag()).toBe(false);
  expect(packet.willRetain()).toBe(false);
  expect(packet.willQos()).toBe(0);
  expect(packet.cleanStart()).toBe(false);
  expect(packet.pwd).toBe(undefined);
  expect(packet.qualityOfService()).toBe(2);
  expect(packet.usr).toBe(undefined);
});

test('can serialize packet', () => {
  const packet1 = PacketConnect.create(5, 30, {}, '');
  const buf = packet1.toBuffer();
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(buf);
  const packet2 = decoder.parse()! as PacketConnect;
  expect(packet2.b).toBe(packet1.b);
  expect(packet2.l).toBe(packet1.l);
  expect(packet2.v).toBe(packet1.v);
  expect(packet2.v).toBe(5);
  expect(packet2.f).toBe(packet1.f);
  expect(packet2.k).toBe(packet1.k);
  expect(packet2.k).toBe(30);
  expect(packet2.id).toBe(packet1.id);
  expect(packet2.id).toBe('');
  expect(packet2.p).toEqual(packet1.p);
  expect(packet2.p).toEqual({});
  expect(packet2.w).toEqual(undefined);
  expect(packet2.wp).toEqual(undefined);
  expect(packet2.wt).toEqual(undefined);
  expect(packet2.usr).toEqual(undefined);
  expect(packet2.pwd).toEqual(undefined);
  expect(packet2).toEqual(packet1);
});

test('can serialize packet in MQTT 3.1.1', () => {
  const packet1 = PacketConnect.create(4, 30, {}, '');
  const buf = packet1.toBuffer();
  const decoder = new MqttDecoder();
  decoder.version = 4;
  decoder.push(buf);
  const packet2 = decoder.parse()! as PacketConnect;
  expect(packet2.b).toBe(packet1.b);
  expect(packet2.l).toBe(packet1.l);
  expect(packet2.v).toBe(packet1.v);
  expect(packet2.v).toBe(4);
  expect(packet2.f).toBe(packet1.f);
  expect(packet2.k).toBe(packet1.k);
  expect(packet2.k).toBe(30);
  expect(packet2.id).toBe(packet1.id);
  expect(packet2.id).toBe('');
  expect(packet2.p).toEqual(packet1.p);
  expect(packet2.p).toEqual({});
  expect(packet2.w).toEqual(undefined);
  expect(packet2.wp).toEqual(undefined);
  expect(packet2.wt).toEqual(undefined);
  expect(packet2.usr).toEqual(undefined);
  expect(packet2.pwd).toEqual(undefined);
  expect(packet2).toEqual(packet1);
});

test('can serialize properties', () => {
  const packet1 = PacketConnect.create(5, 30, {
    [PROPERTY.ContentType]: 'test',
    [PROPERTY.UserProperty]: [
      ['test', 'test'],
    ],
  }, '');
  const buf = packet1.toBuffer();
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(buf);
  const packet2 = decoder.parse()! as PacketConnect;
  expect(packet2.p).toEqual({
    [PROPERTY.ContentType]: 'test',
    [PROPERTY.UserProperty]: [
      ['test', 'test'],
    ],
  });
});

test('can serialize will', () => {
  const packet1 = PacketConnect.create(5, 30, {}, '');
  packet1.setWill(Buffer.from([1, 2, 3, 4, 5]), 'aha', {
    [PROPERTY.ContentType]: 'test',
    [PROPERTY.UserProperty]: [
      ['test', 'test'],
    ],
  }, 2, true)
  const buf = packet1.toBuffer();
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(buf);
  const packet2 = decoder.parse()! as PacketConnect;
  expect(packet2.willFlag()).toBe(true);
  expect(packet2.willQos()).toBe(2);
  expect(packet2.willRetain()).toBe(true);
  expect(packet2.w).toEqual(Buffer.from([1, 2, 3, 4, 5]));
  expect(packet2.wt).toBe('aha');
  expect(packet2.wp).toEqual({
    [PROPERTY.ContentType]: 'test',
    [PROPERTY.UserProperty]: [
      ['test', 'test'],
    ],
  });
});

test('can serialize will and packet properties', () => {
  const packet1 = PacketConnect.create(5, 30, {
    [PROPERTY.ContentType]: 'test2',
    [PROPERTY.UserProperty]: [
      ['test2', 'test2'],
    ],
  }, '');
  packet1.setWill(Buffer.from([1, 2, 3, 4, 5]), 'aha', {
    [PROPERTY.ContentType]: 'test',
    [PROPERTY.UserProperty]: [
      ['test', 'test'],
    ],
  }, 0, false)
  const buf = packet1.toBuffer();
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(buf);
  const packet2 = decoder.parse()! as PacketConnect;
  expect(packet2.p).toEqual({
    [PROPERTY.ContentType]: 'test2',
    [PROPERTY.UserProperty]: [
      ['test2', 'test2'],
    ],
  });
  expect(packet2.willFlag()).toBe(true);
  expect(packet2.willQos()).toBe(0);
  expect(packet2.willRetain()).toBe(false);
  expect(packet2.w).toEqual(Buffer.from([1, 2, 3, 4, 5]));
  expect(packet2.wt).toBe('aha');
  expect(packet2.wp).toEqual({
    [PROPERTY.ContentType]: 'test',
    [PROPERTY.UserProperty]: [
      ['test', 'test'],
    ],
  });
});

test('can serialize password', () => {
  const packet1 = PacketConnect.create(5, 30, {}, 'client-id');
  packet1.setPassword(Buffer.from('password'));
  const buf = packet1.toBuffer();
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(buf);
  const packet2 = decoder.parse()! as PacketConnect;
  expect(packet2).toEqual(packet1);
  expect(packet2.pwd).toEqual(Buffer.from('password'));
  expect(packet2.id).toBe('client-id');
});

test('can serialize username', () => {
  const packet1 = PacketConnect.create(5, 30, {}, 'client-id');
  packet1.setUserName('streamich')
  packet1.setPassword(Buffer.from('password'));
  const buf = packet1.toBuffer();
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(buf);
  const packet2 = decoder.parse()! as PacketConnect;
  expect(packet2.usr).toBe('streamich');
  expect(packet2).toEqual(packet1);
  expect(packet2.pwd).toEqual(Buffer.from('password'));
  expect(packet2.id).toBe('client-id');
});

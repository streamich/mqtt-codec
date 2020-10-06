import { PROPERTY } from '../../../es6/enums';
import {PACKET_TYPE} from '../../enums';
import {PacketConnect} from '../connect';

test('can create a packet', () => {
  const packet = PacketConnect.create(5, 0, 30, {}, 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
  expect(packet.b >> 4).toBe(PACKET_TYPE.CONNECT);
  expect(packet.id).toBe('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
  expect(packet.v).toBe(5);
  expect(packet.f).toBe(0);
  expect(packet.k).toBe(30);
  expect(packet.p).toEqual({});
});

test('can set username', () => {
  const packet = PacketConnect.create(5, 0, 30, {}, 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
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
  const packet = PacketConnect.create(5, 0, 30, {}, 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
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
  const packet = PacketConnect.create(5, 0, 30, {}, 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
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
  const packet = PacketConnect.create(5, 0, 30, {}, 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
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
  const packet = PacketConnect.create(5, 0, 30, {}, 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
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
  const packet = PacketConnect.create(5, 0, 30, {}, 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
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
  const packet = PacketConnect.create(5, 0, 30, {}, 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
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

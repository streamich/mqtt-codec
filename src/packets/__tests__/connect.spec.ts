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

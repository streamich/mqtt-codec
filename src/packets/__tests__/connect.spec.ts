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

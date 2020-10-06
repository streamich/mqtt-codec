import {PACKET_TYPE} from '../../enums';
import { PacketConnack } from '../connack';

test('can create a packet', () => {
  const packet = PacketConnack.create(0, {});
  expect(packet.b >> 4).toBe(PACKET_TYPE.CONNACK);
  expect(packet.l).toBe(0);
  expect(packet.f).toBe(0);
  expect(packet.c).toBe(0);
  expect(packet.p).toEqual({});
});

test('can change Session Present flag', () => {
  const packet = PacketConnack.create(0, {});
  expect(packet.sessionPresent()).toBe(false);
  packet.setSessionPresent(false);
  expect(packet.sessionPresent()).toBe(false);
  packet.setSessionPresent(true);
  expect(packet.sessionPresent()).toBe(true);
  packet.setSessionPresent(true);
  expect(packet.sessionPresent()).toBe(true);
  packet.setSessionPresent(false);
  expect(packet.sessionPresent()).toBe(false);
});

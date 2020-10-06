import {Packet} from '../packet';

test('can set Quality of Service', () => {
  const packet = new Packet(0, 0);
  expect(packet.qualityOfService()).toBe(0);
  packet.setQualityOfService(0);
  expect(packet.qualityOfService()).toBe(0);
  packet.setQualityOfService(1);
  expect(packet.qualityOfService()).toBe(1);
  packet.setQualityOfService(2);
  expect(packet.qualityOfService()).toBe(2);
  packet.setQualityOfService(0);
  expect(packet.qualityOfService()).toBe(0);
});

test('can set DUP flag', () => {
  const packet = new Packet(0, 0);
  expect(packet.dup()).toBe(false);
  packet.setDup(false);
  expect(packet.dup()).toBe(false);
  packet.setDup(true);
  expect(packet.dup()).toBe(true);
  packet.setDup(false);
  expect(packet.dup()).toBe(false);
});

test('can set RETAIN flag', () => {
  const packet = new Packet(0, 0);
  expect(packet.retain()).toBe(false);
  packet.setRetain(false);
  expect(packet.retain()).toBe(false);
  packet.setRetain(true);
  expect(packet.retain()).toBe(true);
  packet.setRetain(false);
  expect(packet.retain()).toBe(false);
});

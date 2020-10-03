import {MqttDecoder} from '../MqttDecoder';
import {connect, connectAck, publish1, subscribe, subscribeAck} from './util';
import {PACKET_TYPE} from '../enums';

it('can instantiate', () => {
  const decoder = new MqttDecoder();
});

it('can parse CONNECT packet fixed header', () => {
  const decoder = new MqttDecoder();
  decoder.push(connect);
  const packet = decoder.parse();
  expect(packet!.l).toBe(connect.byteLength - 2);
  expect(packet!.type()).toBe(PACKET_TYPE.CONNECT);
  expect(packet!.dup()).toBe(false);
  expect(packet!.qos()).toBe(0);
  expect(packet!.retain()).toBe(false);
});

it('can parse CONNACK packet fixed header', () => {
  const decoder = new MqttDecoder();
  decoder.push(connectAck);
  const packet = decoder.parse();
  expect(packet!.l).toBe(connectAck.byteLength - 2);
  expect(packet!.type()).toBe(PACKET_TYPE.CONNACK);
  expect(packet!.dup()).toBe(false);
  expect(packet!.qos()).toBe(0);
  expect(packet!.retain()).toBe(false);
});

it('can parse SUBACK packet fixed header', () => {
  const decoder = new MqttDecoder();
  decoder.push(subscribeAck);
  const packet = decoder.parse();
  expect(packet!.type()).toBe(PACKET_TYPE.SUBACK);
  expect(packet!.dup()).toBe(false);
  expect(packet!.qos()).toBe(0);
  expect(packet!.retain()).toBe(false);
});

it('parses CONNACK variable data', () => {
  const decoder = new MqttDecoder();
  decoder.push(connectAck);
  const packet = decoder.parse();
  expect(!!packet!.data!).toBe(true);
  expect(packet!.l).toBe(2);
  expect(packet!.data!.length).toBe(2);
  expect(packet!.data!.readInt8(0)).toBe(0);
  expect(packet!.data!.readInt8(1)).toBe(0);
});

it('parses PUBLISH variable data', () => {
  const decoder = new MqttDecoder();
  decoder.push(publish1);
  const packet = decoder.parse();
  expect(!!packet!.data!).toBe(true);
  expect(packet!.l).toBe(publish1.byteLength - 2);
});

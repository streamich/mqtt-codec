import {MqttDecoder} from '../MqttDecoder';
import {connect, connectAck, subscribe, subscribeAck} from './util';
import {PACKET_TYPE} from '../enums';

it('can instantiate', () => {
  const decoder = new MqttDecoder();
});

it('can parse first byte packet type of CONNECT packet', () => {
  const decoder = new MqttDecoder();
  decoder.push(connect);
  expect(decoder.packet.b).toBe(0);
  expect(decoder.packet.l).toBe(0);
  decoder.parseFirstByte();
  expect(decoder.packet.b).not.toBe(0);
  expect(decoder.packet.l).toBe(0);
  expect(decoder.packet.type()).toBe(PACKET_TYPE.CONNECT);
});

it('can parse first byte packet type of CONNACK packet', () => {
  const decoder = new MqttDecoder();
  decoder.push(connectAck);
  expect(decoder.packet.b).toBe(0);
  expect(decoder.packet.l).toBe(0);
  decoder.parseFirstByte();
  expect(decoder.packet.b).not.toBe(0);
  expect(decoder.packet.l).toBe(0);
  expect(decoder.packet.type()).toBe(PACKET_TYPE.CONNACK);
});

it('can parse CONNECT packet fixed header', () => {
  const decoder = new MqttDecoder();
  decoder.push(connect);
  const packet = decoder.parse();
  expect(packet!.type()).toBe(PACKET_TYPE.CONNECT);
  expect(packet!.dup()).toBe(false);
  expect(packet!.qos()).toBe(0);
  expect(packet!.retain()).toBe(false);
});

it('can parse CONNACK packet fixed header', () => {
  const decoder = new MqttDecoder();
  decoder.push(connectAck);
  const packet = decoder.parse();
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

import {MqttDecoder} from '../MqttDecoder';
import {connect, connectAck, connectWithClientId, publish1, subscribe, subscribeAck} from './util';
import {PACKET_TYPE, PROPERTY} from '../enums';
import { PacketConnect } from '../packet';

it('can instantiate', () => {
  const decoder = new MqttDecoder();
});

describe('CONNECT', () => {
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

  it('parses protocol version', () => {
    const decoder = new MqttDecoder();
    decoder.push(connect);
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet.v).toBe(5);
  });

  it('parses connection flags', () => {
    const decoder = new MqttDecoder();
    decoder.push(connect);
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet.f).toBe(connect.readUInt8(9));
  });

  it('parses keep-alive', () => {
    const decoder = new MqttDecoder();
    decoder.push(connect);
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet.k).toBe(connect.readUInt16BE(10));
  });

  it('parses properties', () => {
    const decoder = new MqttDecoder();
    decoder.push(connect);
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet.p[PROPERTY.ReceiveMaximum]).toBe(20);
  });

  it('parses empty Client ID', () => {
    const decoder = new MqttDecoder();
    decoder.push(connect);
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet.id).toBe('');
  });

  it('parses non-empty Client ID', () => {
    const decoder = new MqttDecoder();
    decoder.push(connectWithClientId);
    const packet: PacketConnect = decoder.parse() as PacketConnect;
    expect(packet.id).toBe('abc');
  });
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
  expect(packet!.l).toBe(connectAck.byteLength - 2);
  expect(packet!.data!.length).toBe(connectAck.byteLength - 2);
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

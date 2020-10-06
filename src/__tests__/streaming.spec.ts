import {MqttDecoder} from '../MqttDecoder';
import { PacketAuth } from '../packets/auth';
import { PacketConnack } from '../packets/connack';
import { PacketConnect } from '../packets/connect';
import { PacketPublish } from '../packets/publish';

const {
  connectWithProperties,
  connackWithProperties,
  auth,
  publishWithUserProperties,
  publish2Kb
} = require('../../benchmarks/packets');

test('stream 1 byte at a time (1 packet)', () => {
  const decoder = new MqttDecoder();
  const buffer = connectWithProperties;
  const packets = [];
  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer.readUInt8(i);
    const minibuf = Buffer.from([byte]);
    decoder.push(minibuf);
    const packet = decoder.parse();
    if (packet) packets.push(packet);
  }
  expect(packets.length).toBe(1);
  expect(packets[0] instanceof PacketConnect).toBe(true);
  expect(packets[0].l).toBe(125);
});

test('stream 1 byte at a time (many packets)', () => {
  const decoder = new MqttDecoder();
  const buffer = Buffer.concat([
    connectWithProperties,
    connackWithProperties,
    auth,
    publishWithUserProperties,
    publish2Kb,
  ]);
  const packets = [];
  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer.readUInt8(i);
    const minibuf = Buffer.from([byte]);
    decoder.push(minibuf);
    const packet = decoder.parse();
    if (packet) packets.push(packet);
  }
  expect(packets.length).toBe(5);
  expect(packets[0] instanceof PacketConnect).toBe(true);
  expect(packets[1] instanceof PacketConnack).toBe(true);
  expect(packets[2] instanceof PacketAuth).toBe(true);
  expect(packets[3] instanceof PacketPublish).toBe(true);
  expect(packets[4] instanceof PacketPublish).toBe(true);
});

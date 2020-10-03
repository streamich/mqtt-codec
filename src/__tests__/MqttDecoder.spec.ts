import {MqttDecoder} from '../MqttDecoder';
import { connect } from './util';

it('can instantiate', () => {
  const decoder = new MqttDecoder(() => {});
});

it('can parse header', () => {
  const decoder = new MqttDecoder(() => {});
  decoder.push(connect);
  expect(decoder.packet.t).toBe(0);
  expect(decoder.packet.f).toBe(0);
  decoder.parseHeader();
  expect(decoder.packet.t).toBe(1);
  expect(decoder.packet.f).toBe(0);
});

import BufferList from 'bl';
import {DECODER_STATE} from './enums';
import {MqttPacket} from './packet';

export type MqttDecoderOnPacket = (packet: any) => void;

export class MqttDecoder {
  public state: DECODER_STATE = DECODER_STATE.HEADER;
  public error: null | Error = null;
  public list = new BufferList();
  public packet = new MqttPacket();

  constructor (private readonly onPacket: MqttDecoderOnPacket) {}

  public push (buf: Buffer) {
    this.list.append(buf);
  }

  public bufferSize () {
    return this.list.length;
  }

  public reset () {
    this.state = DECODER_STATE.HEADER;
    this.error = null
    this.list = new BufferList();
    this.packet = new MqttPacket();
  }

  public parse (buf: Buffer) {
    if (this.error) this.reset();

    this.list.append(buf)

    return this.parsePacket();
  }

  public parsePacket () {
    if (this.state === DECODER_STATE.HEADER) {
      this.parseHeader();
    }
  }

  public parseHeader () {
    const list = this.list;
    if (!list.length) return;
    const byte = list.readUInt8(0);
    list.consume(1);
    this.state = DECODER_STATE.LENGTH;
    const packet = this.packet;
    packet.t = byte >> 4;
    packet.f = byte & 0b1111;
  }
}

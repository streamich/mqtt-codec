import BufferList from 'bl';
import {DECODER_STATE} from './enums';
import {MqttPacket} from './packet';

export class MqttDecoder {
  public state: DECODER_STATE = DECODER_STATE.BYTE;
  public error: null | Error = null;
  public list = new BufferList();
  public packet = new MqttPacket();

  constructor () {}

  public push (buf: Buffer) {
    this.list.append(buf);
  }

  public bufferSize () {
    return this.list.length;
  }

  public reset () {
    this.state = DECODER_STATE.BYTE;
    this.error = null;
    this.list = new BufferList();
    this.packet = new MqttPacket();
  }

  public parse (): MqttPacket | null {
    this.parseFixedHeader();
    this.parseVariableData();
    const packet = this.packet;
    const isPacketEmpty = !packet.b;
    const isParsingInProgress = this.state !== DECODER_STATE.BYTE;
    if (isPacketEmpty || isParsingInProgress) return null;
    this.packet = new MqttPacket();
    return packet;
  }

  public parseFixedHeader () {
    this.parseFirstByte();
    this.parseLength();
  }

  public parseFirstByte () {
    if (this.state !== DECODER_STATE.BYTE) return;
    const list = this.list;
    if (!list.length) return;
    this.packet.b = list.readUInt8(0);
    list.consume(1);
    this.state = DECODER_STATE.LEN;
  }

  public parseLength () {
    if (this.state !== DECODER_STATE.LEN) return;
    const int = this.consumeVarInt();
    if (int < 0) return;
    this.packet.l = int;
    this.state = DECODER_STATE.DATA;
  }

  private consumeVarInt (): number {
    const list = this.list;
    const length = list.length;
    if (length < 1) return -1;
    const b1 = list.readUInt8(0);
    if (b1 ^ 0b10000000) {
      list.consume(1);
      return b1 & 0b01111111;
    }
    if (length < 2) return -1;
    const b2 = list.readUInt8(1);
    if (b2 ^ 0b10000000) {
      list.consume(2);
      return ((b2 & 0b01111111) << 7) + (b1 & 0b01111111);
    }
    if (length < 3) return -1;
    const b3 = list.readUInt8(2);
    if (b3 ^ 0b10000000) {
      list.consume(3);
      return ((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111);
    }
    if (length < 4) return -1;
    const b4 = list.readUInt8(3);
    list.consume(4);
    return ((b4 & 0b01111111) << 21) + ((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111);
  }

  public parseVariableData (): void {
    if (this.state !== DECODER_STATE.DATA) return;
    const {packet, list} = this;
    const length = packet.l;
    if (!length) {
      this.state = DECODER_STATE.BYTE;
      return;
    }
    if (list.length < length) return;
    packet.data = list.shallowSlice(0, length);
    list.consume(length);
    this.state = DECODER_STATE.BYTE;
  }
}

import BufferList from 'bl';
import {DECODER_STATE, PACKET_TYPE} from './enums';
import {PacketConnack, PacketSuback, PacketPublish} from './packet';
import { PacketConnect } from './packets/connect';

export class MqttDecoder {
  public state: DECODER_STATE = DECODER_STATE.HEADER;
  public error: null | Error = null;
  public list = new BufferList();
  public b: number = 0;
  public l: number = 0;

  constructor () {}

  public push (buf: Buffer) {
    this.list.append(buf);
  }

  public bufferSize () {
    return this.list.length;
  }

  public reset () {
    this.state = DECODER_STATE.HEADER;
    this.error = null;
    this.list = new BufferList();
  }

  public parse (): null | PacketConnect | PacketConnack | PacketSuback | PacketPublish {
    this.parseFixedHeader();
    const data = this.parseVariableData();
    if (!data) return null;
    const {b, l} = this;
    const type: PACKET_TYPE = (b >> 4) as PACKET_TYPE;
    switch (type) {
      case PACKET_TYPE.CONNECT: {
        const packet = PacketConnect.parse(b, l, data);
        return packet;
      }
      case PACKET_TYPE.CONNACK: {
        const packet = new PacketConnack(b, l, data);
        return packet;
      }
      case PACKET_TYPE.SUBACK: {
        const packet = new PacketSuback(b, l, data);
        return packet;
      }
      case PACKET_TYPE.PUBLISH: {
        const packet = new PacketPublish(b, l, data);
        return packet;
      }
      default: {
        return null;
      }
    }
  }

  public parseFixedHeader (): void {
    if (this.state !== DECODER_STATE.HEADER) return;
    const list = this.list;
    const length = list.length;
    if (length < 2) return;
    this.b = list.readUInt8(0);
    const b1 = list.readUInt8(1);
    if (b1 ^ 0b10000000) {
      list.consume(2);
      this.l = b1 & 0b01111111;
      this.state = DECODER_STATE.DATA;
      return;
    }
    if (length < 3) return;
    const b2 = list.readUInt8(2);
    if (b2 ^ 0b10000000) {
      list.consume(3);
      this.l = ((b2 & 0b01111111) << 7) + (b1 & 0b01111111);
      this.state = DECODER_STATE.DATA;
      return;
    }
    if (length < 4) return;
    const b3 = list.readUInt8(3);
    if (b3 ^ 0b10000000) {
      list.consume(4);
      this.l = ((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111);
      this.state = DECODER_STATE.DATA;
      return;
    }
    if (length < 5) return;
    const b4 = list.readUInt8(4);
    list.consume(5);
    this.l = ((b4 & 0b01111111) << 21) + ((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111);
    this.state = DECODER_STATE.DATA;
  }

  // private consumeVarInt (): number {
  //   const list = this.list;
  //   const length = list.length;
  //   if (length < 1) return -1;
  //   const b1 = list.readUInt8(0);
  //   if (b1 ^ 0b10000000) {
  //     list.consume(1);
  //     return b1 & 0b01111111;
  //   }
  //   if (length < 2) return -1;
  //   const b2 = list.readUInt8(1);
  //   if (b2 ^ 0b10000000) {
  //     list.consume(2);
  //     return ((b2 & 0b01111111) << 7) + (b1 & 0b01111111);
  //   }
  //   if (length < 3) return -1;
  //   const b3 = list.readUInt8(2);
  //   if (b3 ^ 0b10000000) {
  //     list.consume(3);
  //     return ((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111);
  //   }
  //   if (length < 4) return -1;
  //   const b4 = list.readUInt8(3);
  //   list.consume(4);
  //   return ((b4 & 0b01111111) << 21) + ((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111);
  // }

  public parseVariableData (): null | BufferList {
    if (this.state !== DECODER_STATE.DATA) return null;
    const {list, l: length} = this;
    if (list.length < length) return null;
    const slice = list.shallowSlice(0, length);
    list.consume(length);
    this.state = DECODER_STATE.HEADER;
    return slice;
  }
}

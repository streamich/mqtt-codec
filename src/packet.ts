import BufferList from 'bl';
import {PACKET_TYPE} from './enums';
import {QoS} from './types';

export interface PacketHeaderData {
  /** Packet first byte. */
  b: number;
  /** Variable length. */
  l: number;
}

export class Packet implements PacketHeaderData {
  /** Packet first byte. */
  public b: number;

  /** Variable length. */
  public l: number;

  constructor(b: number, l: number) {
    this.b = b;
    this.l = l;
  }

  public type(): PACKET_TYPE {
    return this.b >> 4;
  }

  public dup(): boolean {
    return !!(this.b & 0b1000);
  }

  public qos(): QoS {
    return ((this.b >> 1) & 0b11) as QoS;
  }

  public retain(): boolean {
    return !!(this.b & 0b1);
  }
}

export class PacketSuback extends Packet {
  constructor(b: number, l: number, public readonly data: BufferList) {
    super(b, l);
  }
}

export class PacketPublish extends Packet {
  constructor(b: number, l: number, public readonly data: BufferList) {
    super(b, l);
  }
}

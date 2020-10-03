import BufferList from 'bl';
import {PACKET_TYPE} from './enums';

export interface PacketHeaderData {
  /** Packet first byte. */
  b: number;
  /** Variable length. */
  l: number;
}

export class Packet implements PacketHeaderData {
  constructor (public b: number, public l: number, public readonly data: BufferList | null = null) {}

  public type (): PACKET_TYPE {
    return this.b >> 4;
  }

  public dup (): boolean {
    return !!(this.b & 0b1000);
  }

  public qos (): 0 | 1 | 2 {
    return ((this.b >> 1) & 0b11) as 0 | 1 | 2;
  }

  public retain (): boolean {
    return !!(this.b & 0b1);
  }
}

export class PacketConnect extends Packet {
  constructor (b: number, l: number, public readonly data: BufferList) {
    super(b, l, data);
  }
}

export class PacketConnack extends Packet {
  constructor (b: number, l: number, public readonly data: BufferList) {
    super(b, l, data);
  }
}

export class PacketSuback extends Packet {
  constructor (b: number, l: number, public readonly data: BufferList) {
    super(b, l, data);
  }
}

export class PacketPublish extends Packet {
  constructor (b: number, l: number, public readonly data: BufferList) {
    super(b, l, data);
  }
}


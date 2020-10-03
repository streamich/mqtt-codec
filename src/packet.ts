import BufferList from 'bl';
import {PACKET_TYPE} from './enums';
import {Properties, QoS} from './types';
import {parseProps, parseBinary} from './util/parse';

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

  constructor (b: number, l: number) {
    this.b = b;
    this.l = l;
  }

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

export class PacketConnack extends Packet {
  constructor (b: number, l: number, public readonly data: BufferList) {
    super(b, l);
  }
}

export class PacketSuback extends Packet {
  constructor (b: number, l: number, public readonly data: BufferList) {
    super(b, l);
  }
}

export class PacketPublish extends Packet {
  constructor (b: number, l: number, public readonly data: BufferList) {
    super(b, l);
  }
}


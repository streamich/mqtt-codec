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

export interface PacketConnectData extends PacketHeaderData {
  /** Protocol version. */
  v: number;

  /** Connect flags. */
  f: number;

  /** Keep-alive. */
  k: number;

  /** Properties. */
  p: Properties;

  /** Client ID. */
  id: string;

  usr?: string;
  pwd?: string;

}

export class Packet implements PacketHeaderData {
  /** Packet first byte. */
  public b: number;

  /** Variable length. */
  public l: number;

  constructor (b: number, l: number, public readonly data: BufferList | null = null) {
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

export class PacketConnect extends Packet {
  /** Protocol version. */
  public v: number;

  /** Connect flags. */
  public f: number;

  /** Keep-alive. */
  public k: number;

  /** Properties. */
  public p: Properties;

  public id: string;

  constructor (b: number, l: number, public readonly data: BufferList) {
    super(b, l, data);

    this.v = data.readUInt8(6);
    this.f = data.readUInt8(7);
    this.k = data.readUInt16BE(8);
    
    let offset = 10;

    const [props, propsSize] = parseProps(data, offset);
    this.p = props;
    offset += propsSize;

    const clientId = parseBinary(data, offset);
    this.id = clientId.toString('utf8');
    offset += clientId.byteLength;
  }

  public userNameFlag (): boolean {
    return !!(this.f & 0b10000000);
  }

  public passwordFlag (): boolean {
    return !!(this.f & 0b01000000);
  }

  public willRetain (): boolean {
    return !!(this.f & 0b00100000);
  }

  public willQos (): QoS {
    return ((this.f & 0b00011000) >> 3) as QoS;
  }

  public willFlag (): boolean {
    return !!(this.f & 0b00000100);
  }

  public cleanStart (): boolean {
    return !!(this.f & 0b00000010);
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


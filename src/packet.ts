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
  /** Will Properties. */
  wp?: Properties;
  /** Will Topic. */
  wt?: string;
  /** Will Payload. */
  w?: Buffer;
  /** User Name. */
  usr?: string;
  /** Password. */
  pwd?: Buffer;
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

export class PacketConnect extends Packet implements PacketConnectData {
  static parse (b: number, l: number, data: BufferList): PacketConnect {
    const v = data.readUInt8(6);
    const f = data.readUInt8(7);
    const k = data.readUInt16BE(8);
    let offset = 10;
    const [props, propsSize] = parseProps(data, offset);
    const p = props;
    offset += propsSize;
    const clientId = parseBinary(data, offset);
    const id = clientId.toString('utf8');
    offset += clientId.byteLength;
    const packet = new PacketConnect(b, l, v, f, k, p, id);
    if (packet.willFlag()) {
      const [props, propsSize] = parseProps(data, offset);
      packet.wp = props;
      offset += propsSize;
      const willTopic = parseBinary(data, offset);
      packet.wt = willTopic.toString('utf8');
      offset += willTopic.byteLength;
      const willPayload = parseBinary(data, offset);
      packet.w = willPayload;
      offset += willPayload.byteLength;
    }
    if (packet.userNameFlag()) {
      const userName = parseBinary(data, offset);
      packet.usr = userName.toString('utf8');
      offset += userName.byteLength;
    }
    if (packet.passwordFlag()) {
      const password = parseBinary(data, offset);
      packet.pwd = password;
      offset += password.byteLength;
    }
    return packet;
  }

  public wp?: Properties;
  public wt?: string;
  public w?: Buffer;
  public usr?: string;
  public pwd?: Buffer;

  constructor (b: number, l: number, public v: number, public f: number, public k: number, public p: Properties, public id: string) {
    super(b, l);
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


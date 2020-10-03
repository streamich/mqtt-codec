import BufferList from 'bl';
import {Packet, PacketHeaderData} from '../packet';
import {Properties, QoS} from '../types';
import {parseProps, parseBinary} from '../util/parse';

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

export class PacketConnect extends Packet implements PacketConnectData {
  static parse(b: number, l: number, data: BufferList): PacketConnect {
    const v = data.readUInt8(6);
    const f = data.readUInt8(7);
    const k = data.readUInt16BE(8);
    let p: Properties = {};
    let offset = 10;
    if (v === 5) {
      const [props, propsSize] = parseProps(data, offset);
      p = props;
      offset += propsSize;
    }
    const clientId = parseBinary(data, offset);
    const id = clientId.toString('utf8');
    offset += 2 + clientId.byteLength;
    const packet = new PacketConnect(b, l, v, f, k, p, id);
    if (packet.willFlag()) {
      if (v === 5) {
        const [props, propsSize] = parseProps(data, offset);
        packet.wp = props;
        offset += propsSize;
      }
      const willTopic = parseBinary(data, offset);
      packet.wt = willTopic.toString('utf8');
      offset += 2 + willTopic.byteLength;
      const willPayload = parseBinary(data, offset);
      packet.w = willPayload;
      offset += 2 + willPayload.byteLength;
    }
    if (packet.userNameFlag()) {
      const userName = parseBinary(data, offset);
      packet.usr = userName.toString('utf8');
      offset += 2 + userName.byteLength;
    }
    if (packet.passwordFlag()) {
      const password = parseBinary(data, offset);
      packet.pwd = password;
      offset += 2 + password.byteLength;
    }
    return packet;
  }

  public wp?: Properties;
  public wt?: string;
  public w?: Buffer;
  public usr?: string;
  public pwd?: Buffer;

  constructor(
    b: number,
    l: number,
    public v: number,
    public f: number,
    public k: number,
    public p: Properties,
    public id: string,
  ) {
    super(b, l);
  }

  public userNameFlag(): boolean {
    return !!(this.f & 0b10000000);
  }

  public passwordFlag(): boolean {
    return !!(this.f & 0b01000000);
  }

  public willRetain(): boolean {
    return !!(this.f & 0b00100000);
  }

  public willQos(): QoS {
    return ((this.f & 0b00011000) >> 3) as QoS;
  }

  public willFlag(): boolean {
    return !!(this.f & 0b00000100);
  }

  public cleanStart(): boolean {
    return !!(this.f & 0b00000010);
  }
}

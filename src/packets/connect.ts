import {BufferList} from '../BufferList';
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

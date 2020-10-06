import {PACKET_TYPE} from '../enums';
import {Packet, PacketHeaderData} from '../packet';
import {Properties, QoS} from '../types';
import {encodeConnect} from './connect/encodeConnect';

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
  /**
   * @param v Version, i.e. 5 or 4
   * @param k Keep-alive
   * @param p Properties object in case of MQTT 5.0, or empty `{}` object otherwise.
   * @param id Connection ID
   */
  static create(
    v: number,
    k: number,
    p: Properties,
    id: string,
  ): PacketConnect {
    return new PacketConnect(PACKET_TYPE.CONNECT << 4, 0, v, 0, k, p, id);
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

  public setUserName(usr: string) {
    this.usr = usr;
    this.f |= 0b10000000;
  }

  public removeUserName() {
    this.usr = undefined;
    this.f &= ~0b10000000;
  }

  public passwordFlag(): boolean {
    return !!(this.f & 0b01000000);
  }

  public setPassword(pwd: Buffer) {
    this.pwd = pwd;
    this.f |= 0b01000000;
  }

  public removePassword() {
    this.pwd = undefined;
    this.f &= ~0b01000000;
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

  public setWill(will: Buffer, willTopic: string, willProps: Properties, willQualityOfService: QoS, willRetain: boolean) {
    this.w = will;
    this.wt = willTopic;
    this.wp = willProps;
    const bits = ((((willRetain ? 1 : 0) << 2) | (willQualityOfService & 0b11)) << 1) | 1;
    this.f = (this.f & ~0b111100) | (bits << 2);
  }

  public removeWill() {
    this.w = undefined;
    this.wt = undefined;
    this.wp = undefined;
    this.f &= ~0b00111100;
  }

  public cleanStart(): boolean {
    return !!(this.f & 0b00000010);
  }

  public setCleanStart(cleanStart: boolean) {
    this.f = cleanStart ? (this.f | 0b00000010) : (this.f & ~0b00000010);
  }

  public toBuffer(): Buffer {
    return encodeConnect(this);
  }
}

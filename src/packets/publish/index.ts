import {PACKET_TYPE} from '../../enums';
import {Packet, PacketHeaderData} from '../../packet';
import {Properties} from '../../types';
import {encodePublish} from './encodePublish/v1';

export interface PacketPublishData extends PacketHeaderData {
  /** Topic Name. */
  t: string;
  /** Packet Identifier. */
  i: number;
  /** Properties. */
  p: Properties;
  /** Payload. */
  d: Buffer;
}

export class PacketPublish extends Packet implements PacketPublishData {
  /**
   * @param t Topic
   * @param i Packet ID
   * @param p Properties
   * @param d Payload
   */
  static create(
    t: string,
    i: number,
    p: Properties,
    d: Buffer): PacketPublish {
    return new PacketPublish(PACKET_TYPE.PUBLISH << 4, 0, t, i, p, d);
  }

  constructor(
    b: number,
    l: number,
    public t: string,
    public i: number,
    public p: Properties,
    public d: Buffer,
  ) {
    super(b, l);
  }

  public toBuffer(version: number): Buffer {
    return encodePublish(this, version);
  }
}

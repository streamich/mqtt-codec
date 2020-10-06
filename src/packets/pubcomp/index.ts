import {PACKET_TYPE} from '../../enums';
import {Packet, PacketHeaderData} from '../../packet';
import {BufferLike, Properties} from '../../types';
import {parseProps} from '../../util/parseProps';
import {encodePuback} from '../puback/encodePuback';

export interface PacketPubcompData extends PacketHeaderData {
  /** Packet Identifier. */
  i: number;
  /** PUBREL Reason Code. */
  c: number;
  /** Properties. */
  p: Properties;
}

export class PacketPubcomp extends Packet implements PacketPubcompData {
  /**
   * @param i Packet Identifier
   * @param c Reason Code
   * @param p Properties
   */
  static create(i: number, c: number, p: Properties) {
    return new PacketPubcomp(PACKET_TYPE.PUBCOMP << 4, 0, i, c, p);
  }

  constructor(
    b: number,
    l: number,
    public i: number,
    public c: number,
    public p: Properties,
  ) {
    super(b, l);
  }

  public toBuffer(version: number) {
    return encodePuback(this, version);
  }
}

export const parsePubcomp = (b: number, l: number, data: BufferLike, version: number): PacketPubcomp => {
  const i = data.readUInt16BE(0);
  let c: number = 0;
  let p: Properties = {};
  if (version === 5) {
    c = data.readUInt8(2);
    if (l > 3) {
      [p] = parseProps(data, 3);
    }
  }
  return new PacketPubcomp(b, l, i, c, p);
};

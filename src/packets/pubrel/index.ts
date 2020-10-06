import {PACKET_TYPE} from '../../enums';
import {Packet, PacketHeaderData} from '../../packet';
import {BufferLike, Properties} from '../../types';
import {parseProps} from '../../util/parseProps';
import {encodePuback} from '../puback/encodePuback';

export interface PacketPubrelData extends PacketHeaderData {
  /** Packet Identifier. */
  i: number;
  /** PUBREL Reason Code. */
  c: number;
  /** Properties. */
  p: Properties;
}

export class PacketPubrel extends Packet implements PacketPubrelData {
  /**
   * @param i Packet Identifier
   * @param c Reason Code
   * @param p Properties
   */
  static create(i: number, c: number, p: Properties) {
    return new PacketPubrel(PACKET_TYPE.PUBREL << 4, 0, i, c, p);
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

export const parsePubrel = (b: number, l: number, data: BufferLike, version: number): PacketPubrel => {
  const i = data.readUInt16BE(0);
  let c: number = 0;
  let p: Properties = {};
  if (version === 5) {
    c = data.readUInt8(2);
    if (l > 3) {
      [p] = parseProps(data, 3);
    }
  }
  return new PacketPubrel(b, l, i, c, p);
};

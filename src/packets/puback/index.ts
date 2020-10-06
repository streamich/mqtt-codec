import { PACKET_TYPE } from '../../enums';
import {Packet, PacketHeaderData} from '../../packet';
import {BufferLike, Properties} from '../../types';
import {parseProps} from '../../util/parse';
import {encodePuback} from './encodePuback';

export interface PacketPubackData extends PacketHeaderData {
  /** Packet Identifier. */
  i: number;
  /** PUBACK Reason Code. */
  c: number;
  /** Properties. */
  p: Properties;
}

export class PacketPuback extends Packet implements PacketPubackData {
  /**
   * @param i Packet Identifier
   * @param c Reason Code
   * @param p Properties
   */
  static create(i: number, c: number, p: Properties) {
    return new PacketPuback(PACKET_TYPE.PUBACK << 4, 0, i, c, p);
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

export const parsePuback = (b: number, l: number, data: BufferLike, version: number): PacketPuback => {
  const i = data.readUInt16BE(0);
  let c: number = 0;
  let p: Properties = {};
  if (version === 5) {
    c = data.readUInt8(2);
    if (l > 3) {
      [p] = parseProps(data, 3);
    }
  }
  return new PacketPuback(b, l, i, c, p);
};

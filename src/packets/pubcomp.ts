import {Packet, PacketHeaderData} from '../packet';
import {BufferLike, Properties} from '../types';
import {parseProps} from '../util/parseProps';

export interface PacketPubcompData extends PacketHeaderData {
  /** Packet Identifier. */
  i: number;
  /** PUBREL Reason Code. */
  c: number;
  /** Properties. */
  p: Properties;
}

export class PacketPubcomp extends Packet implements PacketPubcompData {
  constructor(
    b: number,
    l: number,
    public i: number,
    public c: number,
    public p: Properties,
  ) {
    super(b, l);
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

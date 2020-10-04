import {BufferList} from '../BufferList';
import {Packet, PacketHeaderData} from '../packet';
import {Properties} from '../types';
import {parseProps} from '../util/parse';

export interface PacketPubrelData extends PacketHeaderData {
  /** Packet Identifier. */
  i: number;
  /** PUBREL Reason Code. */
  c: number;
  /** Properties. */
  p: Properties;
}

export class PacketPubrel extends Packet implements PacketPubrelData {
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

export const parsePubrel = (b: number, l: number, data: BufferList, version: number, offset: number): PacketPubrel => {
  const i = data.readUInt16BE(offset);
  let c: number = 0;
  let p: Properties = {};
  if (version === 5) {
    c = data.readUInt8(offset + 2);
    if (l > 3) {
      [p] = parseProps(data, offset + 3);
    }
  }
  return new PacketPubrel(b, l, i, c, p);
};

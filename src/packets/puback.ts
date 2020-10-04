import {BufferList} from '../BufferList';
import {Packet, PacketHeaderData} from '../packet';
import {Properties} from '../types';
import {parseProps} from '../util/parse';

export interface PacketPubackData extends PacketHeaderData {
  /** Packet Identifier. */
  i: number;
  /** PUBACK Reason Code. */
  c: number;
  /** Properties. */
  p: Properties;
}

export class PacketPuback extends Packet implements PacketPubackData {
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

export const parsePuback = (b: number, l: number, data: BufferList, version: number, offset: number): PacketPuback => {
  const i = data.readUInt16BE(offset);
  let c: number = 0;
  let p: Properties = {};
  if (version === 5) {
    c = data.readUInt8(offset + 2);
    if (l > 3) {
      [p] = parseProps(data, offset + 3);
    }
  }
  return new PacketPuback(b, l, i, c, p);
};

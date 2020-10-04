import BufferList from 'bl';
import {Packet, PacketHeaderData} from '../packet';
import {Properties} from '../types';
import {parseProps} from '../util/parse';

export interface PacketSubackData extends PacketHeaderData {
  /** Packet Identifier. */
  i: number;
  /** Properties. */
  p: Properties;
  /** SUBACK Payload. */
  s: number[];
}

export class PacketSuback extends Packet implements PacketSubackData {
  constructor(
    b: number,
    l: number,
    public i: number,
    public p: Properties,
    public s: number[],
  ) {
    super(b, l);
  }
}

export const parseSuback = (b: number, l: number, data: BufferList, version: number): PacketSuback => {
  const i = data.readUInt16BE(0);
  let offset = 2;
  let p: Properties = {};
  if (version === 5) {
    const [props, size] = parseProps(data, offset);
      p = props;
      offset += size;
  }
  const len = data.length;
  const s: number[] = [];
  while (offset < len) {
    s.push(data.readUInt8(offset++));
  }
  return new PacketSuback(b, l, i, p, s);
};

import {Packet, PacketHeaderData} from '../packet';
import {BufferLike, Properties} from '../types';
import {parseProps} from '../util/parseProps';

export interface PacketUnsubackData extends PacketHeaderData {
  /** Packet Identifier. */
  i: number;
  /** Properties. */
  p: Properties;
  /** SUBACK Payload. */
  s: number[];
}

export class PacketUnsuback extends Packet implements PacketUnsubackData {
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

export const parseUnsuback = (b: number, l: number, buf: BufferLike, version: number): PacketUnsuback => {
  let offset = 0;
  const i = buf.readUInt16BE(offset);
  offset += 2;
  let p: Properties = {};
  if (version === 5) {
    const [props, size] = parseProps(buf, offset);
      p = props;
      offset += size;
  }
  const len = buf.length;
  const s: number[] = [];
  while (offset < len) {
    s.push(buf.readUInt8(offset++));
  }
  return new PacketUnsuback(b, l, i, p, s);
};

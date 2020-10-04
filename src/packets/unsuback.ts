import BufferList from 'bl';
import {Packet, PacketHeaderData} from '../packet';
import {Properties} from '../types';
import {parseProps} from '../util/parse';

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

export const parseUnsuback = (b: number, l: number, data: BufferList, version: number, offset: number): PacketUnsuback => {
  const i = data.readUInt16BE(offset);
  offset += 2;
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
  return new PacketUnsuback(b, l, i, p, s);
};

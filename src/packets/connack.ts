import {BufferList} from '../BufferList';
import {Packet, PacketHeaderData} from '../packet';
import {Properties} from '../types';
import {parseProps} from '../util/parse';

export interface PacketConnackData extends PacketHeaderData {
  /** Connect Acknowledge Flags. */
  f: number;
  /** Connect Reason Code. */
  c: number;
  /** Properties. */
  p: Properties;
}

export class PacketConnack extends Packet implements PacketConnackData {
  constructor(
    b: number,
    l: number,
    public f: number,
    public c: number,
    public p: Properties,
  ) {
    super(b, l);
  }

  public sessionPresent(): boolean {
    return !!(this.f & 0b1);
  }
}

export const parseConnack = (b: number, l: number, data: BufferList, version: number, offset: number): PacketConnack => {
  const f = data.readUInt8(offset);
  const c = data.readUInt8(offset + 1);
  let p: Properties = {};
  if (version === 5) [p] = parseProps(data, offset + 2);
  const packet = new PacketConnack(b, l, f, c, p);
  return packet;
};

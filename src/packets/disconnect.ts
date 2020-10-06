import {Packet, PacketHeaderData} from '../packet';
import {BufferLike, Properties} from '../types';
import {parseProps} from '../util/parseProps';

export interface PacketDisconnectData extends PacketHeaderData {
  /** Disconnect Reason Code. */
  c: number;
  /** Properties. */
  p: Properties;
}

export class PacketDisconnect extends Packet implements PacketDisconnectData {
  constructor(
    b: number,
    l: number,
    public c: number,
    public p: Properties,
  ) {
    super(b, l);
  }
}

export const parseDisconnect = (b: number, l: number, buf: BufferLike, version: number): PacketDisconnect => {
  let c: number = 0;
  let p: Properties = {};
  if (version === 5) {
    c = buf.readUInt8(0);
    if (l > 1) {
      [p] = parseProps(buf, 1);
    }
  }
  return new PacketDisconnect(b, l, c, p);
};

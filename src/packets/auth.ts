import {Packet, PacketHeaderData} from '../packet';
import {BufferLike, Properties} from '../types';
import {parseProps} from '../util/parseProps';

export interface PacketAuthData extends PacketHeaderData {
  /** Authenticate Reason Code. */
  c: number;
  /** Properties. */
  p: Properties;
}

export class PacketAuth extends Packet implements PacketAuthData {
  constructor(
    b: number,
    l: number,
    public c: number,
    public p: Properties,
  ) {
    super(b, l);
  }
}

export const parseAuth = (b: number, l: number, buf: BufferLike, version: number): PacketAuth => {
  const c: number = buf.readUInt8(0);
  const [p] = parseProps(buf, 1);
  return new PacketAuth(b, l, c, p);
};

import {BufferList} from '../BufferList';
import {Packet, PacketHeaderData} from '../packet';
import {Properties} from '../types';
import {parseProps} from '../util/parse';

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

export const parseAuth = (b: number, l: number, data: BufferList, version: number, offset: number): PacketAuth => {
  const c: number = data.readUInt8(offset);
  const [p] = parseProps(data, offset + 1);
  return new PacketAuth(b, l, c, p);
};

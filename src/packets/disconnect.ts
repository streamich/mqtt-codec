import BufferList from 'bl';
import {Packet, PacketHeaderData} from '../packet';
import {Properties} from '../types';
import {parseProps} from '../util/parse';

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

export const parseDisconnect = (b: number, l: number, data: BufferList, version: number, offset: number): PacketDisconnect => {
  let c: number = 0;
  let p: Properties = {};
  if (version === 5) {
    c = data.readUInt8(offset);
    if (l > 1) {
      [p] = parseProps(data, offset + 1);
    }
  }
  return new PacketDisconnect(b, l, c, p);
};

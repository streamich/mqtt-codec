import {PACKET_TYPE} from '../../enums';
import {Packet, PacketHeaderData} from '../../packet';
import {BufferLike, Properties} from '../../types';
import {parseProps} from '../../util/parseProps';
import {encodeDisconnect, DISCONNECT} from './encodeDisconnect';

export {DISCONNECT};

export interface PacketDisconnectData extends PacketHeaderData {
  /** Disconnect Reason Code. */
  c: number;
  /** Properties. */
  p: Properties;
}

export class PacketDisconnect extends Packet implements PacketDisconnectData {
  /**
   * @param c Disconnect Reason Code
   * @param p Properties
   */
  static create(c: number, p: Properties): PacketDisconnect {
    return new PacketDisconnect(PACKET_TYPE.DISCONNECT << 4, 0, c, p);
  }

  constructor(
    b: number,
    l: number,
    public c: number,
    public p: Properties,
  ) {
    super(b, l);
  }

  public toBuffer(version: number): Buffer {
    return encodeDisconnect(this, version);
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

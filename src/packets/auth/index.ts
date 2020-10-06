import {PACKET_TYPE} from '../../enums';
import {Packet, PacketHeaderData} from '../../packet';
import {BufferLike, Properties} from '../../types';
import {parseProps} from '../../util/parseProps';
import {encodeDisconnect} from '../disconnect/encodeDisconnect';

export interface PacketAuthData extends PacketHeaderData {
  /** Authenticate Reason Code. */
  c: number;
  /** Properties. */
  p: Properties;
}

export class PacketAuth extends Packet implements PacketAuthData {
  /**
   * @param c Authenticate Reason Code
   * @param p Properties
   */
  static create(c: number, p: Properties): PacketAuth {
    return new PacketAuth(PACKET_TYPE.AUTH << 4, 0, c, p);
  }

  constructor(
    b: number,
    l: number,
    public c: number,
    public p: Properties,
  ) {
    super(b, l);
  }

  public toBuffer(): Buffer {
    return encodeDisconnect(this, 5);
  }
}

export const parseAuth = (b: number, l: number, buf: BufferLike, version: number): PacketAuth => {
  const c: number = buf.readUInt8(0);
  let p: Properties = {};
  if (l > 1) [p] = parseProps(buf, 1);
  return new PacketAuth(b, l, c, p);
};

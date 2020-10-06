import {PACKET_TYPE} from '../../enums';
import {Packet, PacketHeaderData} from '../../packet';

export const PINGREQ = Buffer.from([PACKET_TYPE.PINGREQ << 4, 0]);

export interface PacketPingreqData extends PacketHeaderData {}

export class PacketPingreq extends Packet implements PacketPingreqData {
  static create(): PacketPingreq {
    return new PacketPingreq(PACKET_TYPE.PINGREQ << 4, 0);
  }

  public toBuffer(): Buffer {
    return PINGREQ;
  }
}

import {PACKET_TYPE} from '../../enums';
import {Packet, PacketHeaderData} from '../../packet';

export const PINGRESP = Buffer.from([PACKET_TYPE.PINGRESP << 4, 0]);

export interface PacketPingrespData extends PacketHeaderData {}

export class PacketPingresp extends Packet implements PacketPingrespData {
  static create(): PacketPingresp {
    return new PacketPingresp(PACKET_TYPE.PINGRESP << 4, 0);
  }

  public toBuffer(): Buffer {
    return PINGRESP;
  }
}

import {BufferList} from '../BufferList';
import {Packet, PacketHeaderData} from '../packet';

export interface PacketPingreqData extends PacketHeaderData {}

export class PacketPingreq extends Packet implements PacketPingreqData {}

export const parsePingreq = (b: number, l: number, data: BufferList, version: number): PacketPingreq => {
  return new PacketPingreq(b, l);
};

import {Packet, PacketHeaderData} from '../packet';

export interface PacketPingrespData extends PacketHeaderData {}

export class PacketPingresp extends Packet implements PacketPingrespData {}

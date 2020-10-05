import {Packet, PacketHeaderData} from '../packet';
import {Properties} from '../types';

export interface PacketPublishData extends PacketHeaderData {
  /** Topic Name. */
  t: string;
  /** Packet Identifier. */
  i: number;
  /** Properties. */
  p: Properties;
  /** Payload. */
  d: Buffer;
}

export class PacketPublish extends Packet implements PacketPublishData {
  constructor(
    b: number,
    l: number,
    public t: string,
    public i: number,
    public p: Properties,
    public d: Buffer,
  ) {
    super(b, l);
  }
}

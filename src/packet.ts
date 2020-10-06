import {PACKET_TYPE} from './enums';
import {QoS} from './types';

export interface PacketHeaderData {
  /** Packet first byte. */
  b: number;
  /** Variable length. */
  l: number;
}

export class Packet implements PacketHeaderData {
  /** Packet first byte. */
  public b: number;

  /**
   * Remaining Length - packet size less first byte and Remaining Length
   * variable integer size.
   */
  public l: number;

  constructor(b: number, l: number) {
    this.b = b;
    this.l = l;
  }

  public type(): PACKET_TYPE {
    return this.b >> 4;
  }

  public dup(): boolean {
    return !!(this.b & 0b1000);
  }

  public qualityOfService(): QoS {
    return ((this.b >> 1) & 0b11) as QoS;
  }

  public retain(): boolean {
    return !!(this.b & 0b1);
  }

  public setDup(dup: boolean) {
    this.b = dup ? (this.b | 0b1000) : (this.b & ~0b1000);
  }

  public setQualityOfService(qos: QoS) {
    this.b = (this.b & ~0b110) | ((qos & 0b11) << 1);
  }

  public setRetain(retain: boolean) {
    this.b = retain ? (this.b | 0b1) : (this.b & ~0b1);
  }
}

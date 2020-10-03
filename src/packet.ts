import BufferList from 'bl';
import {PACKET_TYPE} from './enums';

export interface MqttPacketHeaderData {
  /** Packet first byte. */
  b: number;
  /** Variable length. */
  l: number;
}

export class MqttPacket implements MqttPacketHeaderData {
  public b: number = 0;
  public l: number = 0;

  public data: BufferList | null = null;

  public type (): PACKET_TYPE {
    return this.b >> 4;
  }

  public dup (): boolean {
    return !!(this.b & 0b1000);
  }

  public qos (): 0 | 1 | 2 {
    return ((this.b >> 1) & 0b11) as 0 | 1 | 2;
  }

  public retain (): boolean {
    return !!(this.b & 0b1);
  }
}

import {PACKET_TYPE} from './enums';

export interface IPacket {
  /** Packet type. */
  t: PACKET_TYPE;
  /** Fixed header flags. */
  f: number;
  /** Variable length. */
  l: number;
  key: string | null;
  dat: Buffer | null;
}

export class MqttPacket implements IPacket {
  public t: PACKET_TYPE = PACKET_TYPE.RESERVED;
  public f: number = 0;
  public l: number = 0;
  public key: string | null = null;
  public dat: Buffer | null = null;
}

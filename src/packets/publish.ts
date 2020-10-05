import { PACKET_TYPE } from '../enums';
import {Packet, PacketHeaderData} from '../packet';
import {Properties} from '../types';
import { genProps } from '../util/genProps/v7';

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
  /**
   * @param t Topic
   * @param i Packet ID
   * @param p Properties
   * @param d Payload
   */
  static create(
    t: string,
    i: number,
    p: Properties,
    d: Buffer,): PacketPublish {
    return new PacketPublish(PACKET_TYPE.PUBLISH << 4, 0, t, i, p, d);
  }

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

  public toBuffer(version: number): Buffer {
    const payload = this.d;
    const lenTopic = Buffer.byteLength(this.t);
    const isQosHigh = this.qualityOfService() > 0;
    const emitProps = version === 5;
    const props = emitProps ? genProps(this.p) : null;
    const propsLength = emitProps ? props!.length : 0;
    const remainingLength: number =
      2 + lenTopic +            // topic length
      (isQosHigh ? 2 : 0) +     // packet ID
      propsLength +             // properties
      payload.length;           // payload length
    const remainingLengthSize = remainingLength < 128 ? 1 : remainingLength < 16_384 ? 2 : remainingLength < 2_097_152 ? 3 : 4;
    const bufferLength = 1 + remainingLengthSize + remainingLength;
    const buf = Buffer.allocUnsafe(bufferLength);
    this.l = remainingLength;
    
    buf.writeUInt8(this.b);

    let offset = 1;

    switch (remainingLengthSize) {
      case 1:
        buf.writeUInt8(remainingLength, 1);
        offset = 2;
        break;
      case 2:
        buf.writeUInt16LE(((remainingLength & 0b011111110000000) << 1) | (0b10000000 | (remainingLength & 0b01111111)), 1);
        offset = 3;
        break;
      case 3:
        buf.writeUInt16LE(((0b100000000000000 | (remainingLength & 0b011111110000000)) << 1) | (0b10000000 | (remainingLength & 0b01111111)), 1);
        buf.writeUInt8((remainingLength >> 14) & 0b01111111, 3);
        offset = 4;
        break;
      case 4:
        buf.writeUInt32LE((((((remainingLength >> 21) & 0b01111111) << 8) | (0b10000000 | ((remainingLength >> 14) & 0b01111111))) << 16) |
          ((0b100000000000000 | (remainingLength & 0b011111110000000)) << 1) | (0b10000000 | (remainingLength & 0b01111111)), 1);
        offset = 5;
        break;
    }

    buf.writeUInt16BE(lenTopic, offset);
    offset += 2;
    buf.write(this.t, offset);
    offset += lenTopic;

    if (isQosHigh) {
      buf.writeUInt16BE(this.i, offset);
      offset += 2;
    }

    if (emitProps) {
      props!.copy(buf, offset);
      offset += propsLength;
    }

    payload.copy(buf, offset);
    // offset += payload.length;

    return buf;
  }
}

import {PACKET_TYPE} from '../../enums';
import {Packet, PacketHeaderData} from '../../packet';
import {BufferLike, Properties, QoS} from '../../types';
import {parseBinary} from '../../util/parse';
import {parseProps} from '../../util/parseProps';
import {encodeSubscribe} from './encodeSubscribe';

export interface PacketSubscribeData extends PacketHeaderData {
  /** Packet Identifier. */
  i: number;
  /** Properties. */
  p: Properties;
  /** SUBSCRIBE Payload. */
  s: SubscriptionData[];
}

export interface SubscriptionData {
  /** Topic. */
  t: string;
  /** Subscription Options (flags). */
  f: number;
}

export class PacketSubscribe extends Packet implements PacketSubscribeData {
  /**
   * @param i Packet Identifier
   * @param p Properties
   */
  static create(i: number, p: Properties) {
    return new PacketSubscribe(PACKET_TYPE.SUBSCRIBE << 4, 0, i, p, []);
  }

  constructor(
    b: number,
    l: number,
    public i: number,
    public p: Properties,
    public s: Subscription[],
  ) {
    super(b, l);
  }

  public addSubscription(subscription: Subscription) {
    this.s.push(subscription);
  }

  public toBuffer(version: number) {
    return encodeSubscribe(this, version);
  }
}

export class Subscription implements SubscriptionData {
  static create(t: string, qualityOfService: QoS, noLocal: boolean, retainAsPublished: boolean, retainHandling: number): Subscription {
    const flag = ((((((retainHandling & 0b11) << 1) | (retainAsPublished ? 1 : 0)) << 1) | (noLocal ? 1 : 0)) << 2) | (qualityOfService & 0b11);
    return new Subscription(t, flag);
  }

  constructor (public t: string, public f: number) {}

  public qualityOfService(): number {
    return this.f & 0b11;
  }

  public noLocal(): boolean {
    return !!(this.f & 0b100);
  }

  public retainAsPublished(): boolean {
    return !!(this.f & 0b1000);
  }

  public retainHandling(): number {
    return (this.f & 0b110000) >> 4;
  }
}

export const parseSubscribe = (b: number, l: number, buf: BufferLike, version: number): PacketSubscribe => {
  let offset = 0;
  const i = buf.readUInt16BE(offset);
  offset += 2;
  let p: Properties = {};
  if (version === 5) {
    const [props, size] = parseProps(buf, offset);
      p = props;
      offset += size;
  }
  const len = buf.length;
  const s: Subscription[] = [];
  while (offset < len) {
    const topic = parseBinary(buf, offset);
    offset += 2 + topic.byteLength;
    const f = buf.readUInt8(offset);
    offset++;
    s.push(new Subscription(topic.toString('utf8'), f));
  }
  return new PacketSubscribe(b, l, i, p, s);
};

import BufferList from 'bl';
import {Packet, PacketHeaderData} from '../packet';
import {Properties} from '../types';
import {parseBinary, parseProps} from '../util/parse';

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
  constructor(
    b: number,
    l: number,
    public i: number,
    public p: Properties,
    public s: Subscription[],
  ) {
    super(b, l);
  }
}

export class Subscription implements SubscriptionData {
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

export const parseSubscribe = (b: number, l: number, data: BufferList, version: number): PacketSubscribe => {
  const i = data.readUInt16BE(0);
  let offset = 2;
  let p: Properties = {};
  if (version === 5) {
    const [props, size] = parseProps(data, offset);
      p = props;
      offset += size;
  }
  const len = data.length;
  const s: Subscription[] = [];
  while (offset < len) {
    const topic = parseBinary(data, offset);
    offset += 2 + topic.byteLength;
    const f = data.readUInt8(offset);
    offset++;
    s.push(new Subscription(topic.toString('utf8'), f));
  }
  return new PacketSubscribe(b, l, i, p, s);
};

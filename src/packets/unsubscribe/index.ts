import {PACKET_TYPE} from '../../enums';
import {Packet, PacketHeaderData} from '../../packet';
import {BufferLike, Properties} from '../../types';
import {parseBinary} from '../../util/parse';
import {parseProps} from '../../util/parseProps';
import {encodeUnsubscribe} from './encodeUnsubscribe';

export interface PacketUnsubscribeData extends PacketHeaderData {
  /** Packet Identifier. */
  i: number;
  /** Properties. */
  p: Properties;
  /** Topic Filters. */
  s: string[];
}

export class PacketUnsubscribe extends Packet implements PacketUnsubscribeData {
  /**
   * @param i Packet Identifier
   * @param p Properties
   * @param s Topic Filters
   */
  static create(i: number, p: Properties, s: string[]): PacketUnsubscribe {
    return new PacketUnsubscribe(PACKET_TYPE.UNSUBSCRIBE << 4, 0, i, p, s);
  }

  constructor(
    b: number,
    l: number,
    public i: number,
    public p: Properties,
    public s: string[],
  ) {
    super(b, l);
  }

  public toBuffer(version: number): Buffer {
    return encodeUnsubscribe(this, version);
  }
}

export const parseUnsubscribe = (b: number, l: number, buf: BufferLike, version: number): PacketUnsubscribe => {
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
  const s: string[] = [];
  while (offset < len) {
    const topic = parseBinary(buf, offset);
    s.push(topic.toString('utf8'));
    offset += 2 + topic.byteLength;
  }
  return new PacketUnsubscribe(b, l, i, p, s);
};

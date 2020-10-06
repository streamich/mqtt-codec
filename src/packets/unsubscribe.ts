import {Packet, PacketHeaderData} from '../packet';
import {BufferLike, Properties} from '../types';
import {parseBinary} from '../util/parse';
import {parseProps} from '../util/parseProps';

export interface PacketUnsubscribeData extends PacketHeaderData {
  /** Packet Identifier. */
  i: number;
  /** Properties. */
  p: Properties;
  /** UNSUBSCRIBE Payload. */
  s: string[];
}

export class PacketUnsubscribe extends Packet implements PacketUnsubscribeData {
  constructor(
    b: number,
    l: number,
    public i: number,
    public p: Properties,
    public s: string[],
  ) {
    super(b, l);
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

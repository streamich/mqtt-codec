import {BufferList} from '../BufferList';
import {Packet, PacketHeaderData} from '../packet';
import {Properties} from '../types';
import {parseBinary, parseProps} from '../util/parse';

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

export const parsePublish = (b: number, l: number, data: BufferList, version: number, offset: number): PacketPublish => {
  const topic = parseBinary(data, offset);
  offset += 2 + topic.byteLength;
  let i: number = 0;
  if (((b >> 1) & 0b11) > 0) {
    i = data.readUInt16BE(offset);
    offset += 2;
  }
  let p: Properties = {};
  if (version === 5) {
    const [props, size] = parseProps(data, offset);
    p = props;
    offset += size;
  }
  const d = data.slice(offset, data.length);
  const t = topic.toString('utf8');
  return new PacketPublish(b, l, t, i, p, d);
};

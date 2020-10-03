import BufferList from 'bl';
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

export const parsePublish = (b: number, l: number, data: BufferList, version: number): PacketPublish => {
  const topic = parseBinary(data, 0);
  let offset = 2 + topic.byteLength;
  const i = data.readUInt16BE(offset);
  offset += 2;
  let p: Properties = {};
  if (version === 5) {
    const [props, size] = parseProps(data, offset);
    p = props;
    offset += size;
  }
  const d = data.slice(offset, data.length);
  const packet = new PacketPublish(b, l, topic.toString('utf8'), i, p, d);
  return packet;
};
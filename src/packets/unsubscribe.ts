import BufferList from 'bl';
import {Packet, PacketHeaderData} from '../packet';
import {Properties} from '../types';
import {parseBinary, parseProps} from '../util/parse';

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

export const parseUnsubscribe = (b: number, l: number, data: BufferList, version: number): PacketUnsubscribe => {
  const i = data.readUInt16BE(0);
  let offset = 2;
  let p: Properties = {};
  if (version === 5) {
    const [props, size] = parseProps(data, offset);
      p = props;
      offset += size;
  }
  const len = data.length;
  const s: string[] = [];
  while (offset < len) {
    const topic = parseBinary(data, offset);
    s.push(topic.toString('utf8'));
    offset += 2 + topic.byteLength;
  }
  return new PacketUnsubscribe(b, l, i, p, s);
};

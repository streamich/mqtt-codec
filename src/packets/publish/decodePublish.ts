import {PacketPublish} from '.';
import {BufferLike, Properties} from '../../types';
import {parseBinary} from '../../util/parse';
import {parseProps} from '../../util/parseProps';

export const decodePublish = (b: number, l: number, buf: BufferLike, version: number): PacketPublish => {
  let offset = 0;
  const topic = parseBinary(buf, offset);
  offset += 2 + topic.byteLength;
  let i: number = 0;
  if (((b >> 1) & 0b11) > 0) {
    i = buf.readUInt16BE(offset);
    offset += 2;
  }
  let p: Properties = {};
  if (version === 5) {
    const [props, size] = parseProps(buf, offset);
    p = props;
    offset += size;
  }
  const d = buf.slice(offset, l);
  const t = topic.toString('utf8');
  return new PacketPublish(b, l, t, i, p, d);
};

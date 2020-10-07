import {PacketConnect} from '.';
import {BufferLike, Properties} from '../../types';
import {parseBinary} from '../../util/parse';
import {parseProps} from '../../util/parseProps';

export const decodeConnect = (b: number, l: number, buf: BufferLike): PacketConnect => {
    let offset = 2 + buf.readUInt16BE(0); // Skip "MQTT" or "MQIsdp" protocol name.
    const v = buf.readUInt8(offset++);
    const f = buf.readUInt8(offset++);
    const k = buf.readUInt16BE(offset);
    offset += 2;
    // const ui32 = buf.readUInt32BE(offset);
    // const v = (ui32 & 0xFF000000) >> 24;
    // const f = (ui32 & 0xFF0000) >> 16;
    // const k = (ui32 & 0xFFFF);
    // offset += 4;
    const isV5 = v === 5;
    let p: Properties = {};
    if (isV5) {
      const [props, propsSize] = parseProps(buf, offset);
      p = props;
      offset += propsSize;
    }
    const clientId = parseBinary(buf, offset);
    const id = clientId.toString('utf8');
    offset += 2 + clientId.byteLength;
    const packet = new PacketConnect(b, l, v, f, k, p, id)
    if (packet.willFlag()) {
      if (isV5) {
        const [props, propsSize] = parseProps(buf, offset);
        packet.wp = props;
        offset += propsSize;
      } else packet.wp = {};
      const willTopic = parseBinary(buf, offset);
      packet.wt = willTopic.toString('utf8');
      offset += 2 + willTopic.byteLength;
      const willPayload = parseBinary(buf, offset);
      packet.w = willPayload;
      offset += 2 + willPayload.byteLength;
    }
    if (packet.userNameFlag()) {
      const userName = parseBinary(buf, offset);
      packet.usr = userName.toString('utf8');
      offset += 2 + userName.byteLength;
    }
    if (packet.passwordFlag()) {
      const password = parseBinary(buf, offset);
      packet.pwd = password;
      offset += 2 + password.byteLength;
    }
    return packet;
};

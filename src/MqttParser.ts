import {BufferList} from './BufferList';
import {REASON, PACKET_TYPE} from './enums';
import {parseConnack} from './packets/connack';
import {PacketConnect} from './packets/connect';
import {PacketPublish} from './packets/publish';
import {parsePuback} from './packets/puback';
import {parsePubrec} from './packets/pubrec';
import {parsePubrel} from './packets/pubrel';
import {parsePubcomp} from './packets/pubcomp';
import {parseSubscribe} from './packets/subscribe';
import {parseSuback} from './packets/suback';
import {parseUnsubscribe} from './packets/unsubscribe';
import {parseUnsuback} from './packets/unsuback';
import {parseDisconnect} from './packets/disconnect';
import {parseAuth} from './packets/auth';
import {parseBinary} from './util/parse';
import {parseProps} from './util/parseProps';
import {Properties} from './types';
import {MqttRouter} from './MqttRouter';

const enum PARSER_STATE {
  HEADER = 0,
  DATA = 1,
}

export class MqttParser {
  /** Keeps track of which part message framing are we in. */
  private state: PARSER_STATE = PARSER_STATE.HEADER;

  /** Buffer which contains all unparsed buffered data. */
  public list = new BufferList();

  /** Current packet first byte. */
  public b: number = 0;

  /** Current packet length. */
  public l: number = 0;

  /**
   * MQTT protocol version. Defaults to 4 as that is most popular version now.
   * This version is automatically set to the version received in CONNECT packet.
   */
  public version: number = 4;

  private offset: number = 0;

  constructor(private readonly router: MqttRouter) {}

  /**
   * Use this method to push into decoder all new bytes that arrive over the
   * socket. Each time you push a chunk it can result in zero or more packets
   * returned by `.parse()` method.
   * 
   * @param buf Raw data bytes chunk as received from socket.
   */
  public push(buf: Buffer) {
    this.list.append(buf);
  }

  /**
   * Back-pressure of unparsed data.
   * 
   * @returns Returns number of bytes of data that has been buffered but not
   *          parsed yet.
   */
  public bufferSize() {
    return this.list.length;
  }

  /**
   * @returns Returns a single parsed packet. If there is not enough data in
   *          the buffer to parse a packet, returns `undefined`.
   */
  public parse(): void {
    try {
      const list = this.list;
      if (!list.length) return;

      if (this.state === PARSER_STATE.HEADER) {
        const length = list.length;
        if (length < 2) return;
        this.b = list.readUInt8(0);
        const b1 = list.readUInt8(1);
        if (b1 & 0b10000000) {
          if (length < 3) return;
          const b2 = list.readUInt8(2);
          if (b2 & 0b10000000) {
            if (length < 4) return;
            const b3 = list.readUInt8(3);
            if (b3 & 0b10000000) {
              if (length < 5) return;
              const b4 = list.readUInt8(4);
              this.offset = 5;
              this.l = ((b4 & 0b01111111) << 21) + ((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111);
            } else {
              this.offset = 4;
              this.l = ((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111);
            }
          } else {
            this.offset = 3;
            this.l = ((b2 & 0b01111111) << 7) + (b1 & 0b01111111);
          }
        } else {
          this.offset = 2;
          this.l = b1 & 0b01111111;
        }
        this.state = PARSER_STATE.DATA;
      }

      if (this.state !== PARSER_STATE.DATA) return;

      const {b, l} = this;
      let offset = this.offset;
      const packetEndOffset = offset + l;
      if (list.length < packetEndOffset) return;

      this.state = PARSER_STATE.HEADER;
      this.offset = 0;

      const buf = list.slice(offset, offset + l);
      list.consume(packetEndOffset);

      const type: PACKET_TYPE = (b >> 4) as PACKET_TYPE;
      switch (type) {
        case PACKET_TYPE.PUBLISH: {
          let offset = 0;
          const topic = parseBinary(buf, offset);
          offset += 2 + topic.byteLength;
          let i: number = 0;
          if (((b >> 1) & 0b11) > 0) {
            i = buf.readUInt16BE(offset);
            offset += 2;
          }
          let p: Properties = {};
          if (this.version === 5) {
            const [props, size] = parseProps(buf, offset);
            p = props;
            offset += size;
          }
          const d = buf.slice(offset, packetEndOffset);
          const t = topic.toString('utf8');
          const packet = new PacketPublish(b, l, t, i, p, d);
          this.router.onPublish(packet);
          return;
        }
        case PACKET_TYPE.CONNECT: {
          offset = 2 + buf.readUInt16BE(0); // Skip "MQTT" or "MQIsdp" protocol name.
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
          this.version = packet.v;
          this.router.onConnect(packet);
          return;
        }
        case PACKET_TYPE.CONNACK: return this.router.onConnack(parseConnack(b, l, buf, this.version));
        case PACKET_TYPE.PUBACK: return this.router.onPuback(parsePuback(b, l, buf, this.version));
        case PACKET_TYPE.PUBREC: return this.router.onPubrec(parsePubrec(b, l, buf, this.version));
        case PACKET_TYPE.PUBREL: return this.router.onPubrel(parsePubrel(b, l, buf, this.version));
        case PACKET_TYPE.PUBCOMP: return this.router.onPubcomp(parsePubcomp(b, l, buf, this.version));
        case PACKET_TYPE.SUBSCRIBE: return this.router.onSubscribe(parseSubscribe(b, l, buf, this.version));
        case PACKET_TYPE.SUBACK: return this.router.onSuback(parseSuback(b, l, buf, this.version));
        case PACKET_TYPE.UNSUBSCRIBE: return this.router.onUnsubscribe(parseUnsubscribe(b, l, buf, this.version));
        case PACKET_TYPE.UNSUBACK: return this.router.onUnsuback(parseUnsuback(b, l, buf, this.version));
        case PACKET_TYPE.PINGREQ: return this.router.onPingreq();
        case PACKET_TYPE.PINGRESP: return this.router.onPingresp();
        case PACKET_TYPE.DISCONNECT: return this.router.onDisconnect(parseDisconnect(b, l, buf, this.version));
        case PACKET_TYPE.AUTH: return this.router.onAuth(parseAuth(b, l, buf, this.version));
        default: throw REASON.MalformedPacket;
      }
    } catch (error) {
      throw REASON.ProtocolError;
    }
  }
}

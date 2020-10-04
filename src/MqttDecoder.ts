import {BufferList} from './BufferList';
import {ERROR, PACKET_TYPE} from './enums';
import {PacketConnack, parseConnack} from './packets/connack';
import {PacketConnect, parseConnect} from './packets/connect';
import {PacketPublish} from './packets/publish';
import {PacketPuback, parsePuback} from './packets/puback';
import {PacketPubrec, parsePubrec} from './packets/pubrec';
import {PacketPubrel, parsePubrel} from './packets/pubrel';
import {PacketPubcomp, parsePubcomp} from './packets/pubcomp';
import {PacketSubscribe, parseSubscribe} from './packets/subscribe';
import {PacketSuback, parseSuback} from './packets/suback';
import {PacketUnsubscribe, parseUnsubscribe} from './packets/unsubscribe';
import {PacketUnsuback, parseUnsuback} from './packets/unsuback';
import {PacketPingreq} from './packets/pingreq';
import {PacketPingresp} from './packets/pingresp';
import {PacketDisconnect, parseDisconnect} from './packets/disconnect';
import {PacketAuth, parseAuth} from './packets/auth';
import {parseBinary, parseProps} from './util/parse';
import {Properties} from './types';

const enum DECODER_STATE {
  HEADER = 0,
  DATA = 1,
}

export class MqttDecoder {
  /** Keeps track of which part message framing are we in. */
  private state: DECODER_STATE = DECODER_STATE.HEADER;

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
   *          the buffer to parse a packet, returns `null`.
   */
  public parse():
  | undefined
  | PacketConnect
  | PacketConnack
  | PacketPublish
  | PacketPuback
  | PacketPubrec
  | PacketPubrel
  | PacketPubcomp
  | PacketSubscribe
  | PacketSuback
  | PacketUnsubscribe
  | PacketUnsuback
  | PacketPingreq
  | PacketPingresp
  | PacketDisconnect
  | PacketAuth {
    try {
      const list = this.list;
      if (!list.length) return;

      if (this.state === DECODER_STATE.HEADER) {
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
        this.state = DECODER_STATE.DATA;
      }

      if (this.state !== DECODER_STATE.DATA) return;

      const {b, l} = this;
      let offset = this.offset;
      const packetEndOffset = offset + l;
      if (list.length < packetEndOffset) return;

      this.state = DECODER_STATE.HEADER;
      this.offset = 0;

      const type: PACKET_TYPE = (b >> 4) as PACKET_TYPE;
      switch (type) {
        case PACKET_TYPE.PUBLISH: {
          const topic = parseBinary(list, offset);
          offset += 2 + topic.byteLength;
          let i: number = 0;
          if (((b >> 1) & 0b11) > 0) {
            i = list.readUInt16BE(offset);
            offset += 2;
          }
          let p: Properties = {};
          if (this.version === 5) {
            const [props, size] = parseProps(list, offset);
            p = props;
            offset += size;
          }
          const d = list.slice(offset, packetEndOffset);
          const t = topic.toString('utf8');
          list.consume(packetEndOffset);
          return new PacketPublish(b, l, t, i, p, d);
        }
        case PACKET_TYPE.CONNECT: {
          const packet = parseConnect(b, l, list, offset);
          this.version = packet.v;
          list.consume(packetEndOffset);
          return packet;
        }
        case PACKET_TYPE.CONNACK: {
          const packet = parseConnack(b, l, list, this.version, offset);
          list.consume(packetEndOffset);
          return packet;
        }
        case PACKET_TYPE.PUBACK: {
          const packet = parsePuback(b, l, list, this.version, offset);
          list.consume(packetEndOffset);
          return packet;
        }
        case PACKET_TYPE.PUBREC: {
          const packet = parsePubrec(b, l, list, this.version, offset);
          list.consume(packetEndOffset);
          return packet;
        }
        case PACKET_TYPE.PUBREL: {
          const packet = parsePubrel(b, l, list, this.version, offset);
          list.consume(packetEndOffset);
          return packet;
        }
        case PACKET_TYPE.PUBCOMP: {
          const packet = parsePubcomp(b, l, list, this.version, offset);
          list.consume(packetEndOffset);
          return packet;
        }
        case PACKET_TYPE.SUBSCRIBE: {
          const packet = parseSubscribe(b, l, list, this.version, offset);
          list.consume(packetEndOffset);
          return packet;
        }
        case PACKET_TYPE.SUBACK: {
          const packet = parseSuback(b, l, list, this.version, offset);
          list.consume(packetEndOffset);
          return packet;
        }
        case PACKET_TYPE.UNSUBSCRIBE: {
          const packet = parseUnsubscribe(b, l, list, this.version, offset);
          list.consume(packetEndOffset);
          return packet;
        }
        case PACKET_TYPE.UNSUBACK: {
          const packet = parseUnsuback(b, l, list, this.version, offset);
          list.consume(packetEndOffset);
          return packet;
        }
        case PACKET_TYPE.PINGREQ: {
          const packet = new PacketPingreq(b, l);
          list.consume(packetEndOffset);
          return packet;
        }
        case PACKET_TYPE.PINGRESP: {
          const packet = new PacketPingresp(b, l);
          list.consume(packetEndOffset);
          return packet;
        }
        case PACKET_TYPE.DISCONNECT: {
          const packet = parseDisconnect(b, l, list, this.version, offset);
          list.consume(packetEndOffset);
          return packet;
        }
        case PACKET_TYPE.AUTH: {
          const packet = parseAuth(b, l, list, this.version, offset);
          list.consume(packetEndOffset);
          return packet;
        }
        default: throw ERROR.MALFORMED_PACKET;
      }
    } catch (error) {
      throw ERROR.MALFORMED_PACKET;
    }
  }
}

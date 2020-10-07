import {BufferList} from '../BufferList';
import {REASON, PACKET_TYPE} from '../enums';
import {parseConnack} from '../packets/connack';
import {parsePuback} from '../packets/puback';
import {parsePubrec} from '../packets/pubrec';
import {parsePubrel} from '../packets/pubrel';
import {parsePubcomp} from '../packets/pubcomp';
import {parseSubscribe} from '../packets/subscribe';
import {parseSuback} from '../packets/suback';
import {parseUnsubscribe} from '../packets/unsubscribe';
import {parseUnsuback} from '../packets/unsuback';
import {PacketPingreq} from '../packets/pingreq';
import {PacketPingresp} from '../packets/pingresp';
import {parseDisconnect} from '../packets/disconnect';
import {parseAuth} from '../packets/auth';
import {decodePublish} from '../packets/publish/decodePublish';
import {decodeConnect} from '../packets/connect/decodeConnect';
import {SomePacket} from '../types';

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
   *          the buffer to parse a packet, returns `undefined`.
   */
  public parse(): undefined | SomePacket {
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
      const offset = this.offset;
      const packetEndOffset = offset + l;
      if (list.length < packetEndOffset) return;

      this.state = DECODER_STATE.HEADER;
      this.offset = 0;

      const buf = list.slice(offset, offset + l);
      list.consume(packetEndOffset);

      const type: PACKET_TYPE = (b >> 4) as PACKET_TYPE;
      switch (type) {
        case PACKET_TYPE.CONNECT: {
          const packet = decodeConnect(b, l, buf);
          this.version = packet.v;
          return packet;
        }
        case PACKET_TYPE.PUBLISH: return decodePublish(b, l, buf, this.version);
        case PACKET_TYPE.CONNACK: return parseConnack(b, l, buf, this.version);
        case PACKET_TYPE.PUBACK: return parsePuback(b, l, buf, this.version);
        case PACKET_TYPE.PUBREC: return parsePubrec(b, l, buf, this.version);
        case PACKET_TYPE.PUBREL: return parsePubrel(b, l, buf, this.version);
        case PACKET_TYPE.PUBCOMP: return parsePubcomp(b, l, buf, this.version);
        case PACKET_TYPE.SUBSCRIBE: return parseSubscribe(b, l, buf, this.version);
        case PACKET_TYPE.SUBACK: return parseSuback(b, l, buf, this.version);
        case PACKET_TYPE.UNSUBSCRIBE: return parseUnsubscribe(b, l, buf, this.version);
        case PACKET_TYPE.UNSUBACK: return parseUnsuback(b, l, buf, this.version);
        case PACKET_TYPE.PINGREQ: return new PacketPingreq(b, l);
        case PACKET_TYPE.PINGRESP: return new PacketPingresp(b, l);
        case PACKET_TYPE.DISCONNECT: return parseDisconnect(b, l, buf, this.version);
        case PACKET_TYPE.AUTH: return parseAuth(b, l, buf, this.version);
        default: throw REASON.MalformedPacket;
      }
    } catch (error) {
      throw REASON.ProtocolError;
    }
  }
}

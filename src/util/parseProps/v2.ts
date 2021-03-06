import {REASON, PROPERTY} from '../../enums';
import {BufferLike, Properties} from '../../types';
import {parseBinary, parseVarInt} from '../parse';

export const parseProps = (data: BufferLike, offset: number): [props: Properties, size: number] => {
  let int: number = 0;
  let size: number = 0;

  const b1 = data.readUInt8(offset);
  if (!(b1 & 0b10000000)) {
    int = b1 & 0b01111111;
    size = 1;
  } else {
    const b2 = data.readUInt8(offset + 1);
    if (!(b2 & 0b10000000)) {
      int = ((b2 & 0b01111111) << 7) + (b1 & 0b01111111);
      size = 2;
    } else {
      const b3 = data.readUInt8(offset + 2);
      if (!(b3 & 0b10000000)) {
        int = ((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111);
        size = 3;
      } else {
        const b4 = data.readUInt8(offset + 3);
        int = ((b4 & 0b01111111) << 21) + ((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111);
        size = 4;
      }
    }
  }

  offset += size;
  const end = offset + int;
  const props: Properties = {};
  while (offset < end) {
    const byte = data.readUInt8(offset++);
    switch (byte) {
      case PROPERTY.PayloadFormatIndicator:
      case PROPERTY.RequestProblemInformation:
      case PROPERTY.RequestResponseInformation:
      case PROPERTY.MaximumQoS:
      case PROPERTY.RetainAvailable:
      case PROPERTY.WildcardSubscriptionAvailable:
      case PROPERTY.SubscriptionIdentifierAvailable:
      case PROPERTY.SharedSubscriptionAvailable: {
        props[byte] = data.readUInt8(offset);
        offset += 1;
        break;
      }
      case PROPERTY.ServerKeepAlive:
      case PROPERTY.ReceiveMaximum:
      case PROPERTY.TopicAliasMaximum:
      case PROPERTY.TopicAlias: {
        props[byte] = data.readUInt16BE(offset);
        offset += 2;
        break;
      }
      case PROPERTY.MessageExpiryInterval:
      case PROPERTY.WillDelayInterval:
      case PROPERTY.SessionExpiryInterval:
      case PROPERTY.MaximumPacketSize: {
        props[byte] = data.readUInt32BE(offset);
        offset += 4;
        break;
      }
      case PROPERTY.SubscriptionIdentifier: {
        const [value, size] = parseVarInt(data, offset);
        props[byte] = value;
        offset += size;
        break;
      }
      case PROPERTY.CorrelationData:
      case PROPERTY.AuthenticationData: {
        const {byteLength} = (props[byte] = parseBinary(data, offset));
        offset += 2 + byteLength;
        break;
      }
      case PROPERTY.ContentType:
      case PROPERTY.ResponseTopic:
      case PROPERTY.AssignedClientIdentifier:
      case PROPERTY.AuthenticationMethod:
      case PROPERTY.ResponseInformation:
      case PROPERTY.ServerReference:
      case PROPERTY.ReasonString: {
        const binary = parseBinary(data, offset);
        props[byte] = binary.toString('utf8');
        offset += 2 + binary.byteLength;
        break;
      }
      case PROPERTY.UserProperty: {
        if (!props[PROPERTY.UserProperty]) props[PROPERTY.UserProperty] = [];
        const key = parseBinary(data, offset);
        offset += 2 + key.byteLength;
        const value = parseBinary(data, offset);
        offset += 2 + value.byteLength;
        props[PROPERTY.UserProperty]!.push(key.toString('utf8'), value.toString('utf8'));
        break;
      }
      default: {
        throw REASON.MalformedPacket;
      }
    }
  }
  return [props, int + size];
};
